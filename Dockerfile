# Use official Drogon base image
FROM drogonframework/drogon:latest

WORKDIR /app

# Copy entire source code into container
COPY . .

# Build Drogon app
RUN mkdir -p build && cd build && cmake .. && make -j$(nproc)

# Expose port for the Drogon server
EXPOSE 3000

# Start the app
CMD ["./build/org_chart"]
