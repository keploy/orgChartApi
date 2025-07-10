# Org Chart API

A **RESTful API** built with [Drogon](https://github.com/drogonframework/drogon), a high-performance C++ framework. This API is designed to manage organizational structures, including persons, departments, and job roles.

🔐 **All routes are protected using JWT for token-based authentication**.

## 📚 Endpoints

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

## 1. **Using Docker** (Recommended for ease of setup)

```bash
docker compose up
```

Docker simplifies the setup process and ensures all dependencies are handled automatically.

## 2. **Manual Setup** (For those who prefer to run the project locally)

### 📥 Install Dependencies

```bash
sudo apt-get update -yqq \
    && sudo apt-get install -yqq --no-install-recommends \
    software-properties-common \
    sudo curl wget cmake make pkg-config locales git \
    gcc-11 g++-11 openssl libssl-dev libjsoncpp-dev uuid-dev \
    zlib1g-dev libc-ares-dev postgresql-server-dev-all \
    libmariadb-dev libsqlite3-dev libhiredis-dev \
    && sudo rm -rf /var/lib/apt/lists/*
```

### 🐉 Drogon Installation

```bash
DROGON_ROOT="/drogon"
```

```bash
cd $DROGON_ROOT
```

```bash
git clone https://github.com/drogonframework/drogon
```

```bash
cd drogon
```

```bash
git submodule update --init
```

```bash
mkdir build && cd build
```

```bash
sudo cmake .. -DCMAKE_BUILD_TYPE=Release -DUSE_MYSQL=ON
```

```bash
sudo make -j$(nproc) && sudo make install
```

```bash
drogon_ctl -v
```

### 🗃️ Database Setup

navigate to orgchartAPI repo

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
mysql -h127.0.0.1 -P3306 -uorg -ppassword org_chart < scripts/create_db.sql
mysql -h127.0.0.1 -P3306 -uorg -ppassword org_chart < scripts/seed_db.sql
```

### 🏗️ Build the Project

```bash
git submodule update --init --recursive 
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



## 💡 Usage Guide

### 1. **Register a User:**

Install [HTTPie](https://httpie.io/) if you haven’t already:

```bash
sudo apt install httpie
```

To register a new user, run:

```bash
http post localhost:3000/auth/register username="admin1" password="password"
```

(or)

```bash

curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"password"}'

```

You will receive a JWT token as the response:

```json
{
  "token": "jwt_token_here",
  "username": "admin1"
}
```

### 2. **Login:**

To log in and receive a token:

```bash
http post localhost:3000/auth/login username="admin1" password="password"
```

The response will look like:

```json
{
  "token": "jwt_token_here",
  "username": "admin1"
}
```

### 3. **Access Protected Resources:**

Use the JWT token to access protected endpoints:

```bash
http --auth-type=bearer --auth="your_jwt_token" get localhost:3000/persons offset==1 limit==25 sort_field==id sort_order==asc
```

Sample response:

```json
[
  {
    "id": 2,
    "first_name": "Gary",
    "last_name": "Reed",
    "hire_date": "2018-04-07 01:00:00",
    "job": {
      "id": 2,
      "title": "M1"
    },
    "department": {
      "id": 1,
      "name": "Product"
    },
    "manager": {
      "id": 1,
      "full_name": "Sabryna Peers"
    }
  },
  ...
]
```

---

## 🧯 Troubleshooting

- **OpenSSL not found?**
  If you encounter issues with OpenSSL, point CMake to the OpenSSL installation manually:

  ```bash
  cmake -DOPENSSL_ROOT_DIR=/usr/local/opt/openssl ..
  ```

- **LSP / IntelliSense not working?**
  Enable compile commands for better LSP support:

  ```bash
  cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=ON ..
  ```
