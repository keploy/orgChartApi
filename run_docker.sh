#!/bin/bash

# Define paths for clarity and robustness
APP_BINARY="/app/build/org_chart"
COVERAGE_REPORT_DIR="/app/coverage_report"
GCOVR_LOG_FILE="$COVERAGE_REPORT_DIR/gcovr_output.log" # A dedicated log for gcovr's output

# Ensure the coverage report directory exists before anything else
mkdir -p "$COVERAGE_REPORT_DIR"

find . -name "*.gcda" -delete

# Function to run on exit (e.g., when Ctrl+C is pressed, or main app exits)
cleanup() {
  echo "--- Cleanup function initiated at $(date) ---" # Clear start marker with timestamp
  echo "Current directory before changing for gcovr: $(pwd)"

   # --- CRITICAL: Propagate SIGTERM to the application binary ---
  # Check if APP_PID is set and if the process is still running
  if [ "$APP_PID" -ne 0 ] && kill -0 "$APP_PID" 2>/dev/null; then
    echo "Drogon application (PID: $APP_PID) is still running. Sending SIGTERM to it..."
    kill -TERM "$APP_PID"
    # Give the app a moment (e.g., 5 seconds) to shut down gracefully and flush coverage data
    echo "Giving Drogon app 5 seconds to shut down gracefully and flush coverage data..."
    sleep 5
    # If the app is still running after the graceful period, send SIGKILL as a last resort
    if kill -0 "$APP_PID" 2>/dev/null; then
      echo "Drogon application (PID: $APP_PID) did not stop gracefully. Sending SIGKILL..."
      kill -KILL "$APP_PID"
    fi
  else
    echo "Drogon application (PID: $APP_PID) already stopped, never started, or PID is 0. No SIGTERM sent."
  fi
  # --- END CRITICAL SECTION FOR SIGNALING ---

  # Change to the build directory where .gcno and .gcda files are expected.
  # Use pushd/popd for robust directory changes and error handling.
  pushd /app/build > /dev/null || { echo "ERROR: Could not change to /app/build directory for coverage. Exiting cleanup."; popd > /dev/null 2>/dev/null; return 1; }

  echo "Waiting 1 second to allow for any pending coverage data to flush..."
  sleep 1 # Give a brief moment for any potential in-memory data to flush to disk

  echo "Attempting to generate coverage report using gcovr..."
  # Run gcovr, capture its output (both stdout and stderr), print it to console (tee),
  # AND save it to a dedicated log file for later inspection.
  cd ..
  gcovr -r . --json $COVERAGE_REPORT_DIR/it.json
  gcovr --add-tracefile $COVERAGE_REPORT_DIR/it.json --exclude 'third_party' --exclude 'models' --exclude 'test' --html-details -o "$COVERAGE_REPORT_DIR/report.html" . 2>&1 | tee "$GCOVR_LOG_FILE"
  GCOVR_EXIT_CODE=$? # Capture the exit code of gcovr

  if [ $GCOVR_EXIT_CODE -ne 0 ]; then
    echo "WARNING: gcovr exited with a non-zero status ($GCOVR_EXIT_CODE). Check $GCOVR_LOG_FILE for details."
  else
    echo "gcovr completed successfully. Check $GCOVR_LOG_FILE for detailed output."
  fi

  echo "Coverage report output path: $COVERAGE_REPORT_DIR/report.html"
  echo "--- Cleanup function finished at $(date) ---" # Clear end marker with timestamp

  popd > /dev/null # Go back to the original directory where the script started
}

# Trap signals:
# EXIT: Always runs when the script exits, regardless of how it exits (success, failure, signal).
# INT:  Runs when Ctrl+C is pressed (SIGINT).
# TERM: Runs when `docker stop` or `docker-compose down` sends SIGTERM.
trap cleanup EXIT TERM TERM

echo "Running application: $APP_BINARY..."
echo "Application started at: $(date)" # This line should appear if the script is correct

# Run the Drogon application in the background.
# This is crucial so that the `run_docker.sh` script itself can continue
# to process signals and wait for the application to finish.
"$APP_BINARY" &

# Store the PID (Process ID) of the backgrounded application.
APP_PID=$!

echo "Drogon application PID: $APP_PID" # This line should appear
echo "Waiting for Drogon application to exit or for a stop signal from Docker..." # This line should appear

# Wait for the background application process to finish.
# If the application crashes, `wait` will return, and then the `EXIT` trap will fire.
# If an external signal (like SIGTERM from Docker) is received, `wait` will be interrupted,
# and the `INT` or `TERM` trap will fire.
wait "$APP_PID"

echo "Drogon application process has finished or received a signal. Script is now exiting." # This line should appear
# The script will now naturally exit, automatically triggering the `EXIT` trap
# if it wasn't already triggered by `INT` or `TERM`.