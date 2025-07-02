# 🧩 Org Chart API

A **RESTful API** built with [Drogon](https://github.com/drogonframework/drogon) — a high-performance C++ framework.
This project is designed to manage organizational structures including persons, departments, and job roles.
🔐 **All routes are protected using JWT for token-based authorization.**

## Note: Please try this repository on Linux. If you're on Windows, use WSL, and on macOS, use Lima.

---

## 📚 Endpoints

### 👤 Persons

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

## 🏗️ How to Build the Project

### 📦 Installation

#### System Requirements (Ubuntu 24.04)

Install required tools and dependencies:

```bash
sudo apt install git gcc g++ cmake
sudo apt install libjsoncpp-dev     # jsoncpp
sudo apt install uuid-dev           # uuid
sudo apt install zlib1g-dev         # zlib
sudo apt install openssl libssl-dev # OpenSSL 
sudo apt-get install postgresql-all # PostgreSQL (for DB support)
```

> ⚠️ **Note:** Install database libraries *before* installing Drogon, or you might get `NO DATABASE FOUND` errors.

---

### 🐉 Drogon Installation

```bash
cd $WORK_PATH
git clone https://github.com/drogonframework/drogon
cd drogon
git submodule update --init
mkdir build && cd build
cmake ..
make && sudo make install
```

### ✅ Verify Drogon Installation

```bash
drogon_ctl -v
```

You should see something like:

```
     _
  __| |_ __ ___   __ _  ___  _ __
 / _` | '__/ _ \ / _` |/ _ \| '_ \
| (_| | | | (_) | (_| | (_) | | | |
 \__,_|_|  \___/ \__, |\___/|_| |_|
                 |___/

Version: 1.7.5
Libraries:
  postgresql: yes
  mariadb: yes
  sqlite3: yes
  openssl: yes
  ...
```

---

## 🗃️ Setup Database

### 🐘 Start PostgreSQL

```bash
docker run --name pg -e POSTGRES_PASSWORD=password -d -p 5433:5432 postgres
```

Install Postgres client:

```bash
sudo apt install postgresql-client
```

Login and create database:

```bash
psql 'postgresql://postgres:password@127.0.0.1:5433/'
CREATE DATABASE org_chart;
```

Now seed the database:

```bash
psql 'postgresql://postgres:password@127.0.0.1:5433/org_chart' -f scripts/create_db.sql
psql 'postgresql://postgres:password@127.0.0.1:5433/org_chart' -f scripts/seed_db.sql
```

---

## 🔨 Build the Project

```bash
git clone https://github.com/maikeulb/orgChartApi
git submodule update --init
mkdir build && cd build
cmake ..
make
```

---

## ▶️ Run the App

Make sure `config.json` has the correct DB settings.

Then run the server:

```bash
./org_chart
```

---

## 💡 Usage Guide

### 1. Register a user

Install [HTTPie](https://httpie.io/) if you haven’t already:

```bash
sudo apt install httpie
```

Register:

```bash
http post localhost:3000/auth/register username="admin1" password="password"
```

Response:

```json
{
  "token": "jwt_token_here",
  "username": "admin1"
}
```

---

### 2. Login

```bash
http post localhost:3000/auth/login username="admin1" password="password"
```

Response:

```json
{
  "token": "jwt_token_here",
  "username": "admin"
}
```

---

### 3. Access Protected Resources

```bash
http --auth-type=bearer --auth="your_jwt_token" get localhost:3000/persons offset==1 limit==25 sort_field==id sort_order==asc
```

Sample Response:

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

* **OpenSSL not found?**
  Point CMake manually:

  ```bash
  cmake -DOPENSSL_ROOT_DIR=/usr/local/opt/openssl ..
  ```

* **LSP / IntelliSense not working?**
  Enable compile commands:

  ```bash
  cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=ON ..
  ```
