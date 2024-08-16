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
    groupsId: JSON.stringify([])
  };

  dummyORM.create("User", userInfo);
  return {
    statusCode: 200,
    message: "Successfully sign up"
  };
}

function fetchUserInfo(accountId){
  const accountInfo = dummyORM.findUnique("Account", {
    id: accountId
  });

  if(!accountInfo){
    return {
      statusCode: 404,
      message: "Account not found"
    };
  }

  const userInfo = dummyORM.findUnique("User", {
    id: accountInfo.userId
  });

  if(!userInfo){
    return {
      statusCode: 500,
      message: "User not found but account exists"
    };
  }

  return {
    statusCode: 200,
    message: {
      id: userInfo.id,
      accountId,
      name: userInfo.name,
      avatarHash: accountInfo.avatarHash,
      groupsId: JSON.parse(userInfo.groupsId)
    }
  }
}

function changeUserName(userId, newName){
  const userInfo = dummyORM.findUnique("User", {
    id: userId
  });

  if(!userInfo){
    return {
      statusCode: 404,
      message: "User not found"
    };
  }

  userInfo.name = newName;
  dummyORM.update("User", userInfo);
  return {
    statusCode: 200,
    message: "Successfully update user info"
  };
}