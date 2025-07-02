FROM drogonframework/drogon:latest

WORKDIR /app

# Install build tools and required utilities
RUN apt-get update && \
    apt-get install -y \
        cmake \
        g++ \
        git \
        file \
        binutils && \
    rm -rf /var/lib/apt/lists/*

# Copy source code
COPY . .

# Pull submodules
RUN git submodule update --init --recursive

# Build the project
RUN mkdir -p build && \
    cd build && \
    cmake .. && \
    make -j$(nproc)

# Verify the binary exists
RUN test -f build/org_chart

# Set CMD to the actual binary
CMD ["./build/org_chart"]