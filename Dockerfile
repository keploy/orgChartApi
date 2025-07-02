FROM drogonframework/drogon:latest

WORKDIR /app

# Install build tools and required utilities
RUN apt-get update && apt-get install -y \
    cmake \
    g++ \
    git \
    file \          # Adds the 'file' command
    binutils \      # Adds the 'ldd' command
    && rm -rf /var/lib/apt/lists/*

# Copy source code
COPY . .

# Pull submodules
RUN git submodule update --init --recursive

# Build the project
RUN mkdir -p build && cd build && cmake .. && make -j$(nproc)

# Verify the binary exists (simple check)
RUN [ -f build/org_chart ] || (echo "Binary not found!" && exit 1)

# Set CMD to the actual binary
CMD ["./build/org_chart"]