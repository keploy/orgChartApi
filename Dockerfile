# Start with the base Ubuntu image
FROM ubuntu:22.04

# Set the timezone
ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install necessary dependencies
RUN apt-get update -yqq \
    && apt-get install -yqq --no-install-recommends \
    software-properties-common \
    sudo curl wget cmake make pkg-config locales git \
    gcc-11 g++-11 openssl libssl-dev libjsoncpp-dev uuid-dev \
    zlib1g-dev libc-ares-dev postgresql-server-dev-all \
    libmariadb-dev libsqlite3-dev libhiredis-dev \
    python3 python3-pip dos2unix \
    && rm -rf /var/lib/apt/lists/* \
    && locale-gen en_US.UTF-8

# Set environment variables for localization
ENV LANG=en_US.UTF-8 \
    LANGUAGE=en_US:en \
    LC_ALL=en_US.UTF-8 \
    CC=gcc-11 \
    CXX=g++-11 \
    AR=gcc-ar-11 \
    RANLIB=gcc-ranlib-11 \
    IROOT=/install

# Clone Drogon repository
ENV DROGON_ROOT="$IROOT/drogon"
RUN git clone --depth 1 --recurse-submodules \
    https://github.com/drogonframework/drogon $DROGON_ROOT   # ← submodules pulled

WORKDIR $DROGON_ROOT
RUN mkdir build && cd build && \
    cmake .. -DCMAKE_BUILD_TYPE=Release \
    -DMYSQL_CLIENT=ON  \
    -DPOSTGRESQL_CLIENT=OFF \
    && make -j$(nproc) && make install

# Build Drogon
RUN ./build.sh

WORKDIR /

# Copy source code for your application (from the local directory)
COPY . /app

WORKDIR /app

RUN dos2unix /app/run_docker.sh

# Install build tools for the app 
RUN apt-get update && apt-get install -y cmake g++ git

# Pull submodules for your application
RUN git submodule update --init --recursive 

RUN mkdir -p coverage_report

# Create build directory and build the project
RUN mkdir -p /app/build && cd /app/build && cmake -DCOVERAGE=ON .. && make -j$(nproc)

RUN chmod +x ./run_docker.sh

RUN pip3 install gcovr

ADD https://keploy-enterprise.s3.us-west-2.amazonaws.com/releases/latest/assets/freeze_time_amd64.so /lib/keploy/freeze_time_amd64.so

RUN chmod +x /lib/keploy/freeze_time_amd64.so

ENV LD_PRELOAD=/lib/keploy/freeze_time_amd64.so

# Set CMD to the actual binary
CMD ["./run_docker.sh"]
