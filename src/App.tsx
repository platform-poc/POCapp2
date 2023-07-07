import React, { useEffect, useState } from "react";
import "./index.scss";

import { MsalProvider, useMsal, useMsalAuthentication } from "@azure/msal-react";
import { PublicClientApplication, InteractionRequiredAuthError, InteractionStatus, InteractionType, } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "./authConfig";

const msalInstance = new PublicClientApplication(msalConfig);
// msalInstance
//   .handleRedirectPromise()
//   .then((tokenResponse) => {
//     if (tokenResponse) {
//       return;
//     }
//     const accounts = msalInstance.getAllAccounts();
//     if (accounts.length < 1) {
//       return;
//     }
//     console.log("APP2 ssoSilent");
//     const ssoRequest = {
//       ...loginRequest,
//       loginHint: accounts[0].username,
//     };
//     msalInstance.ssoSilent(ssoRequest)
//     .then(resp => {})
//     .catch(err => {
//       console.log(err);
//     });

//   })
//   .catch((error) => {
//     // Handle redirect error
//   });

const MainComponent = () => {
  const [accessToken, setAccessToken] = useState("");
  const { instance, accounts, inProgress } = useMsal();

  useEffect(() => {
    console.log(inProgress);
    // Silently acquires an access token which is then attached to a request for MS Graph data
    if (accounts.length == 0 || inProgress !== InteractionStatus.None) return;
    console.log("Getting app2 token silently");
    const accessTokenRequest = {
      ...loginRequest,
      account: accounts[0],
    };
    instance
      .acquireTokenSilent(accessTokenRequest)
      .then((response) => {
        setAccessToken(response.accessToken);
        // getAuth0Token(response.accessToken);        
        // callMsGraph(response.accessToken).then((response) =>
        //   setGraphData(response)
        // );
      })
      .catch((error) => {
        if (error instanceof InteractionRequiredAuthError) {
          const ssoRequest = {
            ...loginRequest,
            loginHint: accounts[0].username,
            domainHint: accounts[0].tenantId
          };
          instance.ssoSilent(ssoRequest)
            .then(result => {
              setAccessToken(result.accessToken);
            })
            .catch(error => {
              console.log("APP2_SSO_SILENT_ERROR! attempting popup", error);
              instance
                .acquireTokenPopup(accessTokenRequest)
                .then(function (accessTokenResponse) {
                  // Acquire token interactive success
                  const accessToken = accessTokenResponse.accessToken;
                  // Call your API with token
                  setAccessToken(accessToken);
                })
                .catch(function (error) {
                  // Acquire token interactive failure
                  console.log(error);
                });
            });

        }
        console.log(error);
      });
  }, [instance, accounts, inProgress]);

  return (
    <div className="mt-10 text-3xl mx-auto max-w-6xl">
      <div>Name: app2</div>
      <div>Framework: react</div>
      <div>Language: TypeScript</div>
      <div>CSS: Tailwind</div>
      {accessToken && <>Access Token: {accessToken}</>}
    </div>
  );
}

const App = () => {

  return (
    <MsalProvider instance={msalInstance}>
      <MainComponent />
    </MsalProvider>
  )
};

export default App;
