FROM drogonframework/drogon:latest

WORKDIR /app

# Copy source code
COPY . .

# Install build tools
RUN apt-get update && apt-get install -y cmake g++ git

# Pull submodules
RUN git submodule update --init --recursive

# Build the project
RUN mkdir -p build && cd build && cmake .. && make -j$(nproc)

# Set CMD to the actual binary
CMD ["./build/org_chart"]
