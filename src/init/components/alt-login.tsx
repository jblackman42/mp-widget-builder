import * as React from 'react';

export default ({ userData, setUserData, setError, approot }: { userData: object, setUserData: Function, setError: Function, approot: string }): React.ReactElement => {
  const localStoragePrefix = "mpp-widgets";

  const phcGetAppRoot = () => {
    return `${approot}/widgets`;
  };

  const phcGetAuthConfiguration = () => {
    const root = phcGetAppRoot();
    // https://{platform domain}/widgets/Api/Auth --- This is the same on every instance of MP (as far as I know)
    const configURL = "".concat(root, "/Api/Auth");
    return fetch(configURL).then(
      (configData) => configData.json(),
      () => {
        setError("Unable to retrieve auth info.")
        throw console.error("Unable to retrieve auth info!");
      }
    );
  };

  const phcGetAuthToken = async (cacheKey: string) => {
    const root = phcGetAppRoot();
    const tokenURL = "".concat(root, `/Home/Tokens?cacheKey=${cacheKey}`);

    return fetch(tokenURL)
      .then((tokenData) => tokenData.json())
      .catch((error) => {
        setError("Unable to retrieve auth token.")
        throw (
          (console.error("Unable to retrieve auth token!"),
            console.error(error))
        );
      });
  };

  const phcGetCSRFToken = async () => {
    const root = phcGetAppRoot();
    const CSRFTokenURL = "".concat(root, `/Home/CSRFToken`);

    return fetch(CSRFTokenURL)
      .then((tokenData) => tokenData.json())
      .catch((error) => {
        setError("Unable to retrieve auth token.")
        throw (
          (console.error("Unable to retrieve auth token!"),
            console.error(error))
        );
      });
  };

  const phcRefreshTokens = async () =>
    phcGetAuthConfiguration().then(async (data) => {
      const refreshURLString =
        "".concat(data.signInUrl, "?") +
        "response_type=".concat(data.responseType) +
        "&scope=".concat(data.scope) +
        "&client_id=".concat(data.clientId) +
        "&redirect_uri=".concat(data.redirectUrl) +
        "&nonce=".concat(data.nonce) +
        "&state=REAUTH";
      return fetch(refreshURLString)
        .then(async (response) => {
          const tokens: { accessToken: string, idToken: string, expiresIn: string } = await response.json();
          phcSaveTokens(tokens);
        })
        .then(phcSaveCSRFToken)
        .catch((error) => {
          throw (
            setError("Unable to retrieve auth token.")
              (console.error("Unable to retrieve auth token!"),
                console.error(error))
          );
        });
    });

  const phcGetRequest = async (path: string, includeAuth = true) => {
    const authToken = window.localStorage.getItem(`${localStoragePrefix}_AuthToken`);
    const expiresAfterDate = window.localStorage.getItem(`${localStoragePrefix}_ExpiresAfter`) ?? '';

    const CSRFTokenString = window.sessionStorage.getItem(`${localStoragePrefix}_CSRFToken`);
    const CSRFToken = CSRFTokenString ? JSON.parse(CSRFTokenString) : {};
    const CSRFExpiresAfterDate = new Date(CSRFToken.expiresAfterUtc || 0);

    const isTokenExpired =
      new Date() > new Date(expiresAfterDate) ||
      new Date() > CSRFExpiresAfterDate;

    if (isTokenExpired) await phcRefreshTokens();

    const headers: Record<string, string> = {};

    if (includeAuth && authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }
    if (CSRFToken.token) {
      headers["X-CSRF-Token"] = CSRFToken.token;
    }

    return fetch(path, {
      headers: headers
    })
      .then((response) => {
        if (response.ok) {
          return response.text().then((text) => {
            try {
              return text ? JSON.parse(text) : {};
            } catch (error) {
              console.error(`Failed to parse JSON response from ${path}`, error);
              return {};
            }
          });
        } else {
          return {};
        }
      })
      .catch((error) => {
        console.error(`Unable to make request to ${path}`);
        console.error(error);
        return {};
      });
  };

  const getCurrentUser = async () => {
    const root = phcGetAppRoot();
    const userURL = "".concat(root, `/Api/Auth/User`);

    return phcGetRequest(userURL)
      .then((userData) => userData)
      .catch((error) => {
        setError("Unable to retrieve current user.")
        throw (
          (console.error("Unable to retrieve current user!"),
            console.error(error))
        );
      });
  };

  const phcSaveTokens = (tokenData: { accessToken: string, idToken: string, expiresIn: string }) => {
    const { accessToken, idToken, expiresIn } = tokenData;
    const expireDate = new Date();
    expireDate.setSeconds(expireDate.getSeconds() + parseInt(expiresIn) - 60);

    const tokenStorageData = {
      AuthToken: accessToken,
      ExpiresAfter: expireDate,
      IdToken: idToken,
    };
    Object.entries(tokenStorageData).forEach(([key, value]) => {
      window.localStorage.setItem(`${localStoragePrefix}_${key}`, value.toString());
    });
  };

  const phcSaveCSRFToken = () =>
    phcGetCSRFToken().then((csrfTokenData) => {
      window.sessionStorage.setItem(
        `${localStoragePrefix}_CSRFToken`,
        JSON.stringify(csrfTokenData)
      );
    });

  const phcClearTokens = () => {
    Object.keys(window.localStorage).forEach((key) => {
      if (key.toLowerCase().includes(localStoragePrefix)) {
        window.localStorage.removeItem(key);
      }
    });
  };

  const phcSignIn = () =>
    phcGetAuthConfiguration().then((data) => {
      const loginURLString =
        "".concat(data.signInUrl, "?") +
        "response_type=".concat(data.responseType) +
        "&scope=".concat(data.scope) +
        "&client_id=".concat(data.clientId) +
        "&redirect_uri=".concat(data.redirectUrl) +
        "&nonce=".concat(data.nonce) +
        "&state=".concat(encodeURIComponent(window.location.toString()));
      window.location.replace(loginURLString);
    });

  const phcSignOut = () =>
    phcGetAuthConfiguration().then((data) => {
      const idToken = window.localStorage.getItem(
        `${localStoragePrefix}_IdToken`
      ) ?? '';
      const logoutURLString =
        "".concat(data.signOutUrl, "?") +
        "id_token_hint=".concat(idToken) +
        "&post_logout_redirect_uri=".concat(data.postLogoutRedirectUrl) +
        "&state=".concat(encodeURI(window.location.toString()));

      phcClearTokens();
      window.location.replace(logoutURLString);
    });

  const authenticateUser = () =>
    getCurrentUser()
      .then((userData) => {
        if (!userData || !Object.keys(userData).length) {
          setUserData({});
        };

        setUserData(userData);
      })
      .catch(() => {
        phcClearTokens();
      })

  React.useEffect(() => {
    if (!approot) {
      setError('Missing Required Parameter: \'approot\'');
      return;
    }

    phcSaveCSRFToken();
    const cacheKey = sessionStorage.getItem("cachedKey");
    if (cacheKey) {
      phcGetAuthToken(cacheKey).then((tokenData) => {
        phcSaveTokens(tokenData);
        authenticateUser();
        sessionStorage.removeItem("cachedKey");
      });
      window.history.replaceState(
        null,
        '',
        window.location.origin.toString()
      );
    } else {
      authenticateUser();
    }
  }, []);

  return (
    <div className="phc-user-login-container">
      {userData && !Object.keys(userData).length
        ? <button className="phc-btn" id="phc-loginButton" onClick={phcSignIn}>Log In</button>
        : <button className="phc-btn" id="phc-logoutButton" onClick={phcSignOut}>Log Out</button>
      }
    </div>
  );
}