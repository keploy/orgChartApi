#include "PersonsController.h"
#include "../utils/utils.h"
#include <memory>
#include <utility>
#include <vector>
#include <regex>

using namespace drogon::orm;
using namespace drogon_model::org_chart;

namespace drogon
{
    template <>
    inline Person fromRequest(const HttpRequest &req)
    {
        // Try Content-Type: application/json first
        auto jsonPtr = req.getJsonObject();
        Json::Value json;
        if (jsonPtr)
        {
            json = *jsonPtr;
        }
        else
        {
            // Fallback: parse raw body as JSON
            Json::Reader reader;
            if (!reader.parse(std::string(req.body()), json))
            {
                // Parsing failed, return default Person
                return Person(Json::Value{});
            }
        }

        // Safely coerce string fields to int if present
        if (json.isMember("department_id") && json["department_id"].isString())
            json["department_id"] = std::stoi(json["department_id"].asString());
        if (json.isMember("manager_id") && json["manager_id"].isString())
            json["manager_id"] = std::stoi(json["manager_id"].asString());
        if (json.isMember("job_id") && json["job_id"].isString())
            json["job_id"] = std::stoi(json["job_id"].asString());

        return Person(json);
    }
} // namespace drogon

void PersonsController::get(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback) const
{
    LOG_DEBUG << "get";
    auto sort_field = req->getOptionalParameter<std::string>("sort_field").value_or("id");
    auto sort_order = req->getOptionalParameter<std::string>("sort_order").value_or("asc");
    auto limit = req->getOptionalParameter<int>("limit").value_or(25);
    auto offset = req->getOptionalParameter<int>("offset").value_or(0);

    auto callbackPtr = std::make_shared<std::function<void(const HttpResponsePtr &)>>(std::move(callback));
    auto dbClientPtr = drogon::app().getDbClient();
    const char *sql = "select person.*, \n\
                       job.title as job_title, \n\
                       department.name as department_name, \n\
                       concat(manager.first_name, ' ', manager.last_name) as manager_full_name \n\
                       from person \n\
                       join job on person.job_id =job.id \n\
                       join department on person.department_id=department.id \n\
                       left join person as manager on person.manager_id = manager.id \n\
                       order by $sort_field $sort_order \n\
                       limit ? offset ?;";

    // hack workaroun
    auto sql_sub = std::regex_replace(sql, std::regex("\\$sort_field"), sort_field);
    sql_sub = std::regex_replace(sql_sub, std::regex("\\$sort_order"), sort_order);

    *dbClientPtr << std::string(sql_sub)
                 << limit
                 << offset >>
        [callbackPtr](const Result &result)
    {
        if (result.empty())
        {
            auto resp = HttpResponse::newHttpJsonResponse(makeErrResp("resource not found"));
            resp->setStatusCode(HttpStatusCode::k404NotFound);
            (*callbackPtr)(resp);
            return;
        }

        Json::Value ret{};
        for (auto row : result)
        {
            PersonInfo personInfo{row};
            PersonDetails personDetails{personInfo};
            ret.append(personDetails.toJson());
        }

        auto resp = HttpResponse::newHttpJsonResponse(ret);
        resp->setStatusCode(HttpStatusCode::k200OK);
        (*callbackPtr)(resp);
    } >> [callbackPtr](const DrogonDbException &e)
    {
        LOG_ERROR << e.base().what();
        auto resp = HttpResponse::newHttpJsonResponse(makeErrResp("database error"));
        resp->setStatusCode(HttpStatusCode::k500InternalServerError);
        (*callbackPtr)(resp);
    };
}

void PersonsController::getOne(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback, int personId) const
{
    LOG_DEBUG << "getOne personId: " << personId;
    auto callbackPtr = std::make_shared<std::function<void(const HttpResponsePtr &)>>(std::move(callback));
    auto dbClientPtr = drogon::app().getDbClient();

    const char *sql = "select person.*, \n\
                       job.title as job_title, \n\
                       department.name as department_name, \n\
                       concat(manager.first_name, ' ', manager.last_name) as manager_full_name \n\
                       from person \n\
                       join job on person.job_id =job.id \n\
                       join department on person.department_id=department.id \n\
                       left join person as manager on person.manager_id = manager.id \n\
                       where person.id = ?";

    *dbClientPtr << std::string(sql)
                 << personId >>
        [callbackPtr](const Result &result)
    {
        if (result.empty())
        {
            auto resp = HttpResponse::newHttpJsonResponse(makeErrResp("resource not found"));
            resp->setStatusCode(HttpStatusCode::k404NotFound);
            (*callbackPtr)(resp);
            return;
        }

        auto row = result[0];
        PersonInfo personInfo{row};
        PersonDetails personDetails{personInfo};

        Json::Value ret = personDetails.toJson();
        auto resp = HttpResponse::newHttpJsonResponse(ret);
        resp->setStatusCode(HttpStatusCode::k200OK);
        (*callbackPtr)(resp);
    } >> [callbackPtr](const DrogonDbException &e)
    {
        LOG_ERROR << e.base().what();
        auto resp = HttpResponse::newHttpJsonResponse(makeErrResp("database error"));
        resp->setStatusCode(HttpStatusCode::k500InternalServerError);
        (*callbackPtr)(resp);
    };
}

void PersonsController::createOne(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback, Person &&pPerson) const
{
    LOG_DEBUG << "createOne";
    auto callbackPtr = std::make_shared<std::function<void(const HttpResponsePtr &)>>(std::move(callback));
    auto dbClientPtr = drogon::app().getDbClient();

    auto errResp = [&](const std::string &msg, int code = 400)
    {
        auto resp = HttpResponse::newHttpJsonResponse(makeErrResp(msg));
        resp->setStatusCode(static_cast<HttpStatusCode>(code));
        (*callbackPtr)(resp);
    };

    /* ---------- VALIDATE REQUIRED FIELDS ---------- */
    if (!pPerson.getLastName() || pPerson.getLastName()->empty())
        return errResp("last_name is compulsory");

    if (!pPerson.getFirstName() || pPerson.getFirstName()->empty())
        return errResp("first_name is compulsory");

    if (!pPerson.getHireDate())
        return errResp("hire_date is compulsory");

    if (!pPerson.getDepartmentId())
        return errResp("department_id is compulsory");
    if (!rowExists(dbClientPtr, "department", pPerson.getValueOfDepartmentId()))
        return errResp("department_id is invalid", 422);

    if (!pPerson.getJobId())
        return errResp("job_id is compulsory");
    if (!rowExists(dbClientPtr, "job", pPerson.getValueOfJobId()))
        return errResp("job_id is invalid", 422);

    /* ---------- MANAGER (optional) ---------- */
    if (pPerson.getManagerId() && // provided
        !rowExists(dbClientPtr, "person", pPerson.getValueOfManagerId()))
        return errResp("manager_id is invalid", 422);

    if (personNameExists(dbClientPtr,
                         *pPerson.getFirstName(),
                         *pPerson.getLastName()))
        return errResp("person with the same first_name and last_name already exists");

    Mapper<Person> mp(dbClientPtr);
    mp.insert(
        pPerson,
        [callbackPtr](const Person &person)
        {
            Json::Value ret{};
            ret = person.toJson();
            auto resp = HttpResponse::newHttpJsonResponse(ret);
            resp->setStatusCode(HttpStatusCode::k201Created);
            (*callbackPtr)(resp);
        },
        [callbackPtr](const DrogonDbException &e)
        {
            LOG_ERROR << e.base().what();
            auto resp = HttpResponse::newHttpJsonResponse(makeErrResp("database error"));
            resp->setStatusCode(HttpStatusCode::k500InternalServerError);
            (*callbackPtr)(resp);
        });
}

void PersonsController::updateOne(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback, int personId, Person &&pPerson) const
{
    LOG_DEBUG << "updateOne personId: " << personId;
    auto dbClientPtr = drogon::app().getDbClient();

    // blocking IO
    Mapper<Person> mp(dbClientPtr);
    Person person;
    try
    {
        person = mp.findFutureByPrimaryKey(personId).get();
    }
    catch (const DrogonDbException &e)
    {
        auto resp = HttpResponse::newHttpJsonResponse(makeErrResp("resource not found"));
        resp->setStatusCode(HttpStatusCode::k404NotFound);
        callback(resp);
        return;
    }

    auto callbackPtr = std::make_shared<std::function<void(const HttpResponsePtr &)>>(std::move(callback));

    auto errResp = [&](const std::string &msg, int code = 400)
    {
        auto resp = HttpResponse::newHttpJsonResponse(makeErrResp(msg));
        resp->setStatusCode(static_cast<HttpStatusCode>(code));
        (*callbackPtr)(resp);
    };

    if (pPerson.getJobId() != nullptr)
    {
        if (!rowExists(dbClientPtr, "job", pPerson.getValueOfJobId()))
            return errResp("job_id is invalid", 422);
        person.setJobId(pPerson.getValueOfJobId());
    }
    if (pPerson.getManagerId() != nullptr)
    {
        if (!rowExists(dbClientPtr, "person", pPerson.getValueOfManagerId()))
            return errResp("manager_id is invalid", 422);
        person.setManagerId(pPerson.getValueOfManagerId());
    }
    if (pPerson.getDepartmentId() != nullptr)
    {
        if (!rowExists(dbClientPtr, "department", pPerson.getValueOfDepartmentId()))
            return errResp("department_id is invalid", 422);
        person.setDepartmentId(pPerson.getValueOfDepartmentId());
    }
    if (pPerson.getFirstName() != nullptr)
    {
        person.setFirstName(pPerson.getValueOfFirstName());
    }
    if (pPerson.getLastName() != nullptr)
    {
        person.setLastName(pPerson.getValueOfLastName());
    }

    mp.update(
        person,
        [callbackPtr](const std::size_t count)
        {
            auto resp = HttpResponse::newHttpResponse();
            resp->setStatusCode(HttpStatusCode::k204NoContent);
            (*callbackPtr)(resp);
        },
        [callbackPtr](const DrogonDbException &e)
        {
            LOG_ERROR << e.base().what();
            auto resp = HttpResponse::newHttpJsonResponse(makeErrResp("database error"));
            resp->setStatusCode(HttpStatusCode::k500InternalServerError);
            (*callbackPtr)(resp);
        });
}

void PersonsController::deleteOne(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback, int personId) const
{
    LOG_DEBUG << "deleteOne personId: ";
    auto callbackPtr = std::make_shared<std::function<void(const HttpResponsePtr &)>>(std::move(callback));
    auto dbClientPtr = drogon::app().getDbClient();

    Mapper<Person> mp(dbClientPtr);
    mp.deleteBy(
        Criteria(Person::Cols::_id, CompareOperator::EQ, personId),
        [callbackPtr](const std::size_t count)
        {
            auto resp = HttpResponse::newHttpResponse();
            resp->setStatusCode(HttpStatusCode::k204NoContent);
            (*callbackPtr)(resp);
        },
        [callbackPtr](const DrogonDbException &e)
        {
            LOG_ERROR << e.base().what();
            auto resp = HttpResponse::newHttpJsonResponse(makeErrResp("database error"));
            resp->setStatusCode(HttpStatusCode::k500InternalServerError);
            (*callbackPtr)(resp);
        });
}

void PersonsController::getDirectReports(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback, int personId) const
{
    LOG_DEBUG << "getDirectReports personId: " << personId;
    auto callbackPtr = std::make_shared<std::function<void(const HttpResponsePtr &)>>(std::move(callback));
    auto dbClientPtr = drogon::app().getDbClient();

    // blocking IO
    Mapper<Person> mp(dbClientPtr);
    Person department;
    try
    {
        department = mp.findFutureByPrimaryKey(personId).get();
    }
    catch (const DrogonDbException &e)
    {
        auto resp = HttpResponse::newHttpJsonResponse(makeErrResp("resource not found"));
        resp->setStatusCode(HttpStatusCode::k404NotFound);
        callback(resp);
    }

    department.getPersons(dbClientPtr, [callbackPtr](const std::vector<Person> persons)
                          {
          if (persons.empty()) {
             auto resp = HttpResponse::newHttpJsonResponse(makeErrResp("resource not found"));
             resp->setStatusCode(HttpStatusCode::k404NotFound);
             (*callbackPtr)(resp);
          } else {
             Json::Value ret{};
             for (auto p : persons) {
                 ret.append(p.toJson());
             }
             auto resp = HttpResponse::newHttpJsonResponse(ret);
             resp->setStatusCode(HttpStatusCode::k200OK);
             (*callbackPtr)(resp);
          } }, [callbackPtr](const DrogonDbException &e)
                          {
          LOG_ERROR << e.base().what();
          auto resp = HttpResponse::newHttpJsonResponse(makeErrResp("database error"));
          resp->setStatusCode(HttpStatusCode::k500InternalServerError);
          (*callbackPtr)(resp); });
}

PersonsController::PersonDetails::PersonDetails(const PersonInfo &personInfo)
{
    id = personInfo.getValueOfId();
    first_name = personInfo.getValueOfFirstName();
    last_name = personInfo.getValueOfLastName();
    hire_date = personInfo.getValueOfHireDate();
    Json::Value managerJson{};
    managerJson["id"] = personInfo.getValueOfManagerId();
    managerJson["full_name"] = personInfo.getValueOfManagerFullName();
    this->manager = managerJson;
    Json::Value departmentJson{};
    departmentJson["id"] = personInfo.getValueOfDepartmentId();
    departmentJson["name"] = personInfo.getValueOfDepartmentName();
    this->department = departmentJson;
    Json::Value jobJson{};
    jobJson["id"] = personInfo.getValueOfJobId();
    jobJson["title"] = personInfo.getValueOfJobTitle();
    this->job = jobJson;
}

auto PersonsController::PersonDetails::toJson() -> Json::Value
{
    Json::Value ret{};
    ret["id"] = id;
    ret["first_name"] = first_name;
    ret["last_name"] = last_name;
    ret["hire_date"] = hire_date.toDbStringLocal();
    ret["manager"] = manager;
    ret["department"] = department;
    ret["job"] = job;
    return ret;
}
