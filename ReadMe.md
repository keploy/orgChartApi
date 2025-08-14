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

## 📦 Get Started

```bash
docker compose up
```

UI will be available on http://localhost:5173

## Keploy Integration (API Testing and Coverage)

Integrate Keploy to automatically record, replay, and generate coverage for your API tests.

### 1. Run Application in Record Mode

```bash
keploy record -c "docker compose up" --container-name "drogon_app"
```

### 2. Use the UI to hit the requests

### 3. Stop Keploy and Run in Test Mode

```bash
keploy test -c "docker compose up" --container-name "drogon_app" --delay 20
```

### 4. View Coverage Report

coverage report will be created in coverage_report folder automatically

---

For more, see [Keploy Docs](https://docs.keploy.io/).
