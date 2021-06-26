import express from "express";
import axios from "axios";
import path from "path";
import "dotenv/config";

const app = express();

let auth;
let loginCount = 0;
const { EMAIL, PASSWORD, APP_KEY, USER_AGENT } = process.env;

app.use(express.json());
app.use(express.static("public"));

const option = (req, token, session_id) => {
  return {
    method: "get",
    url: "https://api.fshare.vn/api/session/download",
    headers: {
      "User-Agent": USER_AGENT,
      Cookie: `session_id=${session_id}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      url: req.query.url,
      password: req.query.password,
      token: token,
      zipflag: 0,
    }),
  };
};

const login = async () => {
  const result = await axios.post(
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
  );
  loginCount++;
  console.info(`Login Count: ${loginCount}`);
  auth = result.data;
}

app.get("/", (_, res) => {
  return res.sendFile("views/index.html", { root: path.resolve() });
});

app.get("/generate", async (req, res) => {
  try {
    let result = await axios(option(req, auth.token, auth.session_id));

    if (result.data.code === 201) {
      await login();
      result = await axios(option(req, auth.token, auth.session_id));
    }

    if (result.data.code === 123) {
      return res.json(result.data);
    } else {
      return res.json({ ...result.data, code: 200 });
    }

  } catch (error) {
    if (error.response?.data?.code === 404) {
      return res.json(error.response.data);
    }
    return res.json({ error: error });
  }
});

app.listen(process.env.PORT || 8080, () => login());
