const spreadSheetId = PropertiesService.getScriptProperties().getProperty("spreadSheetId");
const dummyORM = new Dummy.ORM(spreadSheetId);

function myFunction(){
    return "Hello World!";
}

function signIn(name, password){
  const user = dummyORM.findUnique("User", {
    name,
    password
  });

  if(user){
    return user.id;
  }

  const newUserId = uuid();
  dummyORM.create("User", {
    id: newUserId,
    name,
    password,
    groupsId: []
  });
  return newUserId;
}

async function signInWithDiscord(code){
  const url = "https://discord.com/api/oauth2/token";

  const clientId = PropertiesService.getScriptProperties().getProperty("DISCORD_CLIENT_ID");
  const clientSecret = PropertiesService.getScriptProperties().getProperty("DISCORD_CLIENT_SECRET");
  const frontendAddress = PropertiesService.getScriptProperties().getProperty("FRONTEND_ADDRESS");

  if(!clientId || !clientSecret || !frontendAddress){
    Logger.log("Error client id or client secret is not set properly");
    const result = {
      statusCode: 500,
    };
    return JSON.stringify(result);
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
    return JSON.stringify(result);
  }

  const result = {
    statusCode: 200,
    payload: data.access_token
  };

  return result;
}

function createGroup(name, adminId){
  const groupId = uuid();
  dummyORM.create("Group", {
    id: groupId,
    name,
    usersId: [adminId],
    adminId
  });

  return groupId;
}

function joinGroup(userId, groupId){
  const user = dummyORM.findUnique("User", {id: userId});
  if(!user){
    Logger.log(`Error: Invalid user id ${userId}`);
    return "401";
  }

  if(user.groupsId.includes(groupId)){
    Logger.log("Already joined");
    return "200";
  }

  const group = dummyORM.findUnique("Group", {id: groupId});
  if(!group){
    Logger.log(`Error: Invalid group id ${groupId}`);
    return "400";
  }

  user.groupsId.push(groupId);
  dummyORM.update("User", user);
  
  group.usersId.push(userId);
  dummyORM.update("Group", group);

  return "200";
}

function leaveGroup(userId, groupId){
  const user = dummyORM.findUnique("User", {id: userId});
  if(!user){
    Logger.log(`Error: Invalid user id ${userId}`);
    return "401";
  }

  if(!user.groupsId.includes(groupId)){
    Logger.log("Already leaved");
    return "200";
  }

  const group = dummyORM.findUnique("Group", {id: groupId});
  if(!group){
    Logger.log(`Error: Invalid group id ${groupId}`);
    return "400";
  }

  user.groupsId = user.groupsId.filter(id => id !== groupId);
  dummyORM.update("User", user);
  group.usersId = group.usersId.filter(id => id !== userId);
  dummyORM.update("Group", group);
  return "200";
}