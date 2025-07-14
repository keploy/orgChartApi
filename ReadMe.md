# Org Chart API

## 📑 Index

1. [Overview](#overview)
2. [Endpoints](#-endpoints)
   - [Persons](#persons)
   - [Departments](#-departments)
   - [Jobs](#-jobs)
   - [Auth](#-auth)
3. [Getting Started](#-two-ways-to-get-started)
   - [Using Docker](#1-using-docker)
   - [Manual Setup](#2-manual-setup-for-those-who-prefer-to-run-the-project-locally)
     - [Install Dependencies](#-install-dependencies)
     - [Drogon Installation](#-drogon-installation)
     - [Database Setup](#database-setup)
     - [Build the Project](#build-the-project)
4. [UT and Coverage](#-ut-and-coverage)
5. [Usage Guide](#-usage-guide)
6. [keploy Integration and Coverage](#keploy-integration-api-testing-and-coverage)

## Overview

A **RESTful API** built with [Drogon](https://github.com/drogonframework/drogon), a high-performance C++ framework. This API is designed to manage organizational structures, including persons, departments, and job roles.

🔐 **All routes are protected using JWT for token-based authentication**.

## 📚 Endpoints

### 🧍 Persons

| Method   | URI                                                       | Action                    |
| -------- | --------------------------------------------------------- | ------------------------- |
| `GET`    | `/persons?limit={}&offset={}&sort_field={}&sort_order={}` | Retrieve all persons      |
| `GET`    | `/persons/{id}`                                           | Retrieve a single person  |
| `GET`    | `/persons/{id}/reports`                                   | Retrieve direct reports   |
| `POST`   | `/persons`                                                | Create a new person       |
| `PUT`    | `/persons/{id}`                                           | Update a person's details |
| `DELETE` | `/persons/{id}`                                           | Delete a person           |

---

### 🏢 Departments

| Method   | URI                                                           | Action                      |
| -------- | ------------------------------------------------------------- | --------------------------- |
| `GET`    | `/departments?limit={}&offset={}&sort_field={}&sort_order={}` | Retrieve all departments    |
| `GET`    | `/departments/{id}`                                           | Retrieve a department       |
| `GET`    | `/departments/{id}/persons`                                   | Retrieve department members |
| `POST`   | `/departments`                                                | Create a department         |
| `PUT`    | `/departments/{id}`                                           | Update department info      |
| `DELETE` | `/departments/{id}`                                           | Delete a department         |

---

### 💼 Jobs

| Method   | URI                                                     | Action                        |
| -------- | ------------------------------------------------------- | ----------------------------- |
| `GET`    | `/jobs?limit={}&offset={}&sort_fields={}&sort_order={}` | Retrieve all job roles        |
| `GET`    | `/jobs/{id}`                                            | Retrieve a job role           |
| `GET`    | `/jobs/{id}/persons`                                    | Retrieve people in a job role |
| `POST`   | `/jobs`                                                 | Create a job role             |
| `PUT`    | `/jobs/{id}`                                            | Update job role               |
| `DELETE` | `/jobs/{id}`                                            | Delete a job role             |

---

### 🔐 Auth

| Method | URI              | Action                              |
| ------ | ---------------- | ----------------------------------- |
| `POST` | `/auth/register` | Register a user and get a JWT token |
| `POST` | `/auth/login`    | Login and receive a JWT token       |

---

## 📦 Two Ways to Get Started

There are two ways to run the project:

### 1. Using Docker

**in `config.json` file change the host from `127.0.0.1` to db**

```bash
docker compose up
```

Docker simplifies the setup process and ensures all dependencies are handled automatically.

### 2. **Manual Setup** (For those who prefer to run the project locally)

### 📥 Install Dependencies

```bash
sudo apt-get update -yqq \
  && sudo apt-get install -yqq --no-install-recommends \
    software-properties-common \
    curl wget cmake make pkg-config locales git \
    gcc-11 g++-11 openssl libssl-dev libjsoncpp-dev uuid-dev \
    zlib1g-dev libc-ares-dev postgresql-server-dev-all \
    libmariadb-dev libsqlite3-dev libhiredis-dev \
  && sudo rm -rf /var/lib/apt/lists/*
```

### 🐉 Drogon Installation

```bash
DROGON_ROOT="$HOME/drogon"
```

```bash
git clone --depth 1 --recurse-submodules https://github.com/drogonframework/drogon $DROGON_ROOT
```

```bash
cd $HOME/drogon
```

```bash
mkdir build && cd build
```

```bash
cmake .. -DCMAKE_BUILD_TYPE=Release -DUSE_MYSQL=ON
```

```bash
make -j$(nproc) && sudo make install
```

```bash
drogon_ctl -v
```

### Database Setup

```bash
navigate to orgchartAPI repo folder
```

```bash
docker run --name db \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=org_chart \
  -e MYSQL_USER=org \
  -e MYSQL_PASSWORD=password \
  -p 3306:3306 \
  -d mysql:8.3 \
  --default-authentication-plugin=mysql_native_password
```

```bash
sudo apt install default-mysql-client
```

```bash
mysql -h127.0.0.1 -P3306 -uorg -ppassword org_chart < scripts/create_db.sql
mysql -h127.0.0.1 -P3306 -uorg -ppassword org_chart < scripts/seed_db.sql
```

### Build the Project

```bash
git submodule update --init --recursive
```

```bash
git submodule add https://github.com/google/googletest third_party/gtest
```

```bash
git submodule add https://github.com/google/googlemock third_party/gmock
```

```bash
mkdir build && cd build
```

```bash
cmake ..
```

```bash
make
```

```bash
./org_chart
```

## 🧪 UT and Coverage

There are already some unit tests in the repository. Here’s how you can run them and generate a coverage report:

1. Install `gcovr`

   ```bash
   sudo apt install gcovr
   ```

2. Navigate to the orgChartAPI Repository

3. Build the Project with Coverage Enabled  
   Follow the [Build the Project](#build-the-project) steps, but **replace**:

   ```bash
   cmake ..
   ```

   with

   ```bash
   cmake -DCOVERAGE=ON ..
   ```

4. Run the Unit Tests

   ```bash
   ./test/org_chart_test
   ```

5. Navigate to the orgChartAPI Repository

6. Generate the Coverage Report
   ```bash
   mkdir -p coverage
   gcovr -r . --html --html-details -o coverage/coverage.html
   ```

Open `coverage/coverage.html` in your browser to view the coverage report.

## 💡 Usage Guide

Use the `postman.json` for postman collection and try the requests

## Keploy Integration (API Testing and Coverage)

Integrate [Keploy](https://keploy.io) to automatically record, replay, and generate coverage for your API tests.

---

### 1. Install Keploy

**Open Source:**

```bash
curl --silent -O -L https://keploy.io/install.sh && source install.sh
```

**Enterprise:**

```bash
curl --silent -O -L https://keploy.io/ent/install.sh && source install.sh
```

---

### 2. Run Application in Record Mode

**If using Docker Compose:**

```bash
keploy record -c "docker compose up" --container-name "drogon_app"
```

**Or, if running manually:**

```bash
keploy record -c "./org_chart"
```

---

### 3. Hit and Record API Requests

Example (Register a new user):

```bash
curl --location 'http://localhost:3000/auth/register' \
  --header 'Content-Type: application/json' \
  --data '{
    "username": "admin3adwes2",
    "password": "password"
  }'
```

---

### 4. Stop Keploy and Run in Test Mode

**With Docker Compose:**

```bash
keploy test -c "docker compose up" --container-name "drogon_app"
```

**Or, manually:**

```bash
keploy test -c "./org_chart"
```

---

### 5. View Coverage Report

Coverage will be **automatically saved** if the build was done with the `-DCOVERAGE=ON` flag during CMake.

for combined coverage you can do something like this

1. After you ran the uts save the coverage to a json

   ```bash
   gcovr -r . --json ut.json
   ```

2. remove the saved coverage object files

   ```bash
   find . -name "*.gcda" -delete
   ```

3. After you ran keploy test save the coverage to another json

   ```bash
   gcovr -r . --json it.json
   ```

4. Generate report for ut

   ```bash
   gcovr --add-tracefile ut.json --html --html-details -o coverage-ut/coverage.html
   ```

5. Generate report for it

   ```bash
   gcovr --add-tracefile it.json --html --html-details -o coverage-it/coverage.html
   ```

6. generate report for combined

   ```bash
   gcovr merge --add-tracefile ut.json --add-tracefile it.json --json -o merged.json
   ```

   ```bash
   gcovr --add-tracefile merged.json --html --html-details -o coverage-combined/coverage.html
   ```

---

For more, see [Keploy Docs](https://docs.keploy.io/).
