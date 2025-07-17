#include <third_party/libbcrypt/include/bcrypt/BCrypt.hpp>
#include "AuthController.h"
#include "../plugins/JwtPlugin.h"

using namespace drogon::orm;
using namespace drogon_model::org_chart;

namespace drogon
{
    template <>
    inline User fromRequest(const HttpRequest &req)
    {
        auto jsonPtr = req.getJsonObject();
        if (jsonPtr)
        {
            return User(*jsonPtr);
        }

        Json::Value json;
        Json::Reader reader;
        if (reader.parse(std::string(req.body()), json))
        { // <-- FIXED
            return User(json);
        }

        return User(Json::Value{});
    }
}

void AuthController::registerUser(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback, User &&pUser) const
{
    LOG_DEBUG << "registerUser";
    try
    {
        auto dbClientPtr = drogon::app().getDbClient();
        Mapper<User> mp(dbClientPtr);

        if (!areFieldsValid(pUser))
        {
            Json::Value ret{};
            ret["error"] = "missing fields";
            auto resp = HttpResponse::newHttpJsonResponse(ret);
            resp->setStatusCode(HttpStatusCode::k400BadRequest);
            callback(resp);
            return;
        }

        if (!isUserAvailable(pUser, mp))
        {
            Json::Value ret{};
            ret["error"] = "username is taken";
            auto resp = HttpResponse::newHttpJsonResponse(ret);
            resp->setStatusCode(HttpStatusCode::k400BadRequest);
            callback(resp);
            return;
        }

        auto newUser = pUser;
        newUser.setPassword(BCrypt::generateHash(newUser.getValueOfPassword()));
        mp.insertFuture(newUser).get();

        auto userWithToken = AuthController::UserWithToken(newUser);
        Json::Value ret = userWithToken.toJson();
        auto resp = HttpResponse::newHttpJsonResponse(ret);
        resp->setStatusCode(HttpStatusCode::k201Created);
        callback(resp);
    }
    catch (const DrogonDbException &e)
    {
        LOG_ERROR << e.base().what();
        Json::Value ret{};
        ret["error"] = "database error";
        auto resp = HttpResponse::newHttpJsonResponse(ret);
        resp->setStatusCode(HttpStatusCode::k500InternalServerError);
        callback(resp);
    }
}

void AuthController::loginUser(const HttpRequestPtr &req, std::function<void(const HttpResponsePtr &)> &&callback, User &&pUser) const
{
    LOG_DEBUG << "loginUser";
    try
    {
        auto dbClientPtr = drogon::app().getDbClient();
        Mapper<User> mp(dbClientPtr);

        if (!areFieldsValid(pUser))
        {
            Json::Value ret{};
            ret["error"] = "missing fields";
            auto resp = HttpResponse::newHttpJsonResponse(ret);
            resp->setStatusCode(HttpStatusCode::k400BadRequest);
            callback(resp);
            return;
        }

        auto user = mp.findFutureBy(Criteria(User::Cols::_username, CompareOperator::EQ, pUser.getValueOfUsername())).get();
        if (user.empty())
        {
            Json::Value ret{};
            ret["error"] = "user not found";
            auto resp = HttpResponse::newHttpJsonResponse(ret);
            resp->setStatusCode(HttpStatusCode::k400BadRequest);
            callback(resp);
            return;
        }

        if (!isPasswordValid(pUser.getValueOfPassword(), user[0].getValueOfPassword()))
        {
            Json::Value ret{};
            ret["error"] = "username and password do not match";
            auto resp = HttpResponse::newHttpJsonResponse(ret);
            resp->setStatusCode(HttpStatusCode::k401Unauthorized);
            callback(resp);
            return;
        }

        auto userWithToken = AuthController::UserWithToken(user[0]);
        auto ret = userWithToken.toJson();
        auto resp = HttpResponse::newHttpJsonResponse(ret);
        callback(resp);
    }
    catch (const DrogonDbException &e)
    {
        LOG_ERROR << e.base().what();
        Json::Value ret{};
        ret["error"] = "database error";
        auto resp = HttpResponse::newHttpJsonResponse(ret);
        resp->setStatusCode(HttpStatusCode::k500InternalServerError);
        callback(resp);
    }
}

bool AuthController::areFieldsValid(const User &user) const
{
    return user.getUsername() != nullptr && user.getPassword() != nullptr;
}

bool AuthController::isUserAvailable(const User &user, Mapper<User> &mp) const
{
    auto criteria = Criteria(User::Cols::_username, CompareOperator::EQ, user.getValueOfUsername());
    return mp.findFutureBy(criteria).get().empty();
}

bool AuthController::isPasswordValid(const std::string &text, const std::string &hash) const
{
    return BCrypt::validatePassword(text, hash);
}

AuthController::UserWithToken::UserWithToken(const User &user)
{
    auto *jwtPtr = drogon::app().getPlugin<JwtPlugin>();
    auto jwt = jwtPtr->init();
    token = jwt.encode("user_id", user.getValueOfId());
    username = user.getValueOfUsername();
}

Json::Value AuthController::UserWithToken::toJson()
{
    Json::Value ret{};
    ret["username"] = username;
    ret["token"] = token;
    return ret;
}

void AuthController::deregisterUser(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    User && /*pUser*/) const // accept it, but ignore it.
{
    LOG_DEBUG << "deregisterUser";

    const auto jsonPtr = req->getJsonObject();
    if (!jsonPtr || !jsonPtr->isMember("username") || !(*jsonPtr)["username"].isString())
    {
        auto resp = HttpResponse::newHttpJsonResponse({{"error", "missing or invalid 'username'"}});
        resp->setStatusCode(HttpStatusCode::k400BadRequest);
        return callback(resp);
    }

    std::string username = (*jsonPtr)["username"].asString();
    if (username.empty() || username.size() > 128)
    {
        auto resp = HttpResponse::newHttpJsonResponse({{"error", "invalid 'username' length"}});
        resp->setStatusCode(HttpStatusCode::k400BadRequest);
        return callback(resp);
    }

    auto cbPtr = std::make_shared<std::function<void(const HttpResponsePtr &)>>(
        std::move(callback));
    auto client = drogon::app().getDbClient();
    Mapper<User> mp(client);

    mp.deleteBy(
        Criteria(User::Cols::_username, CompareOperator::EQ, username),
        [cbPtr](std::size_t count)
        {
            Json::Value body;
            HttpStatusCode code;
            if (count == 0)
            {
                body["error"] = "user not found";
                code = HttpStatusCode::k404NotFound;
            }
            else
            {
                body["message"] = "user deregistered successfully";
                code = HttpStatusCode::k200OK;
            }
            auto resp = HttpResponse::newHttpJsonResponse(body);
            resp->setStatusCode(code);
            (*cbPtr)(resp);
        },
        [cbPtr](const DrogonDbException &e)
        {
            LOG_ERROR << e.base().what();
            auto resp = HttpResponse::newHttpJsonResponse({{"error", "database error"}});
            resp->setStatusCode(HttpStatusCode::k500InternalServerError);
            (*cbPtr)(resp);
        });
}
