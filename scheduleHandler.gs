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

function signInWithDiscord(code){
  const fetchAccessTokenResult = fetchDiscordAccessToken(code);

  if(fetchAccessTokenResult.statusCode !== 200){
    return fetchAccessTokenResult;
  }

  const accessToken = fetchAccessTokenResult.payload;
  const fetchAccountInfoResult = fetchDiscordAccountInfo(accessToken);

  if(fetchAccountInfoResult.statusCode !== 200){
    return fetchAccountInfoResult;
  }

  createUser(fetchAccountInfoResult.payload);
  return fetchAccessTokenResult;
}

function createUser(fetchedInfo){
  const existingAccountInfo = dummyORM.findUnique("Account", {
    id: fetchedInfo.id
  });

  if(existingAccountInfo){
    const newAccountInfo = {
      ...fetchedInfo,
      userId: existingAccountInfo.userId
    };
    dummyORM.update("Account", newAccountInfo);
    return;
  }

  const userId = uuid();
  const accountInfo = {
    ...fetchedInfo,
    userId
  }
  dummyORM.create("Account", accountInfo);

  const userInfo = {
    id: userId,
    name: fetchedInfo.name,
    groupsId: []
  };

  dummyORM.create("User", userInfo);
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