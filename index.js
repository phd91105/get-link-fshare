import express from "express";
import axios from "axios";
import path from "path";
import "dotenv/config";

const app = express();

let auth;
const { EMAIL, PASSWORD, APP_KEY, USER_AGENT } = process.env;
app.use(express.json());

app.get("/login", (_, res) => {
  axios
    .post(
      "https://api.fshare.vn/api/user/login",
      {
        user_email: EMAIL,
        password: PASSWORD,
        app_key: APP_KEY,
      },
      {
        headers: {
          "User-Agent": USER_AGENT,
        },
      }
    )
    .then((response) => {
      auth = response.data;
      res.json({ msg: "login success" });
    });
});

app.get("/", (_, res) => {
  res.sendFile("views/index.html", { root: path.resolve() });
});

app.get("/generate", (req, res) => {
  try {
    axios({
      method: "get",
      url: "https://api.fshare.vn/api/session/download",
      headers: {
        "User-Agent": USER_AGENT,
        Cookie: `session_id=${auth.session_id}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        url: req.query.url,
        password: req.query.password,
        token: auth.token,
        zipflag: 0,
      }),
    })
      .then(async function (response) {
        if (response.data.code == 201) {
          await refreshToken();
          axios({
            method: "get",
            url: "https://api.fshare.vn/api/session/download",
            headers: {
              "User-Agent": USER_AGENT,
              Cookie: `session_id=${auth.session_id}`,
              "Content-Type": "application/json",
            },
            data: JSON.stringify({
              url: req.query.url,
              password: req.query.password,
              token: auth.token,
              zipflag: 0,
            }),
          })
            .then(function (response) {
              res.json({ ...response.data, code: 200 });
            })
            .catch(function (error) {
              res.json(error.response.data);
            });
        } else if (response.data.code == 123) {
          res.json(response.data);
        } else res.json({ ...response.data, code: 200 });
      })
      .catch(function (error) {
        res.json(error.response.data);
      });
  } catch (error) {
    res.json({ error: error });
  }
});

function refreshToken() {
  return new Promise((resolve) => {
    axios
      .post(
        "https://api.fshare.vn/api/user/login",
        {
          user_email: EMAIL,
          password: PASSWORD,
          app_key: APP_KEY,
        },
        {
          headers: {
            "User-Agent": USER_AGENT,
          },
        }
      )
      .then((response) => {
        resolve((auth = response.data));
      });
  });
}

app.listen(process.env.PORT || 8080);
