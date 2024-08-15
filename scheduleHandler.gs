const spreadSheetId = PropertiesService.getScriptProperties().getProperty("spreadSheetId");
const dummyORM = new Dummy.ORM(spreadSheetId);

function myFunction(){
    return "Hello World!";
}

/**
 * @param{string} - stringified discord account info
 * @returns result of sheet control
 */
function signInWithDiscord(param){
  const fetchedInfo = JSON.parse(param);
  const existingAccountInfo = dummyORM.findUnique("Account", {
    id: fetchedInfo.id
  });

  // Sign In
  if(existingAccountInfo){
    const newAccountInfo = {
      ...fetchedInfo,
      userId: existingAccountInfo.userId
    };
    dummyORM.update("Account", newAccountInfo);
    return {
      statusCode: 200,
      message: "Successfully sign in"
    };
  }

  // Sign Up
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
  return {
    statusCode: 200,
    message: "Successfully sign up"
  };
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