function fetchDiscordAccessToken(code) {
  const url = "https://discord.com/api/oauth2/token";

  const clientId = PropertiesService.getScriptProperties().getProperty("DISCORD_CLIENT_ID");
  const clientSecret = PropertiesService.getScriptProperties().getProperty("DISCORD_CLIENT_SECRET");
  const frontendAddress = PropertiesService.getScriptProperties().getProperty("FRONTEND_ADDRESS");

  if(!clientId || !clientSecret || !frontendAddress){
    Logger.log("Error client id or client secret is not set properly");
    const result = {
      statusCode: 500,
    };
    return result;
  }

  const payload = [
    `client_id=${encodeURIComponent(clientId)}`,
    `client_secret=${encodeURIComponent(clientSecret)}`,
    `code=${encodeURIComponent(code)}`,
    "grant_type=authorization_code",
    `redirect_uri=${frontendAddress}/login`
  ].join('&');;

  const options = {
    "method": "POST",
    "headers": {"Content-Type": "application/x-www-form-urlencoded"},
    "payload": payload
  }

  const response = UrlFetchApp.fetch(url, options);
  const responseText = response.getContentText();
  const data = JSON.parse(responseText);

  if(data.error){
    const result = {
      statusCode: 401
    };
    return result;
  }

  const result = {
    statusCode: 200,
    payload: data.access_token
  };

  return result;
}

function fetchDiscordAccountInfo(accessToken){
  const url = "https://discord.com/api/users/@me";
  const options = {
    "headers": {"authorization": `Bearer ${accessToken}`}
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseText = response.getContentText();
  const data = JSON.parse(responseText);

  if(!data.id){
    const result = {
      statusCode: 401
    };
    return result;
  }

  return {
    statusCode: 200,
    payload: {
      id: data.id,
      name: data.global_name || data.username || "Unnamed User",
      avatarHash: data.avatar
    }
  };
}
