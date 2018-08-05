// const base_url ="http://10.10.1.52:9099/salespad/";
// const base_url = 'http://microservices-1933370804.us-east-1.elb.amazonaws.com/salespad/';
 const base_url= 'http://beta-microservices-1219850419.us-east-1.elb.amazonaws.com/salespad/';
 //const base_url = 'http://devmicroservices-772323968.us-east-1.elb.amazonaws.com/salespad/';
// const base_url = 'http://10.10.1.51:9097/salespad/';
//const localgetAccturl = 'http://10.10.30.24:9097/salespad/';
// const tempurl = 'http://192.168.1.171:9097/salespad/';
// const base_url = tempurl;
export const urls = {
  getUsersUrl: base_url + 'getUsers',
  getUsersBySearchUrl: base_url + 'getUsersBySearchTerm',
  getAcctOrgsUrl: base_url + 'getAcctOrgs',
  updateUsersDataUrl: base_url + 'updateUserData',
  getOrgsUrl: base_url + 'getOrgs',
  getDetailsByOrgIdUrl: base_url + 'getDetailsByOrgId',
  getRecordsByUserUrl: base_url + 'getRecordsByUser',
  updateAttributeValueUrl: base_url + 'updateAttributeValue',
  getPoPrefixUrl: base_url + 'getAttributeValue',
  getWdOrgsUrl: base_url + 'getWdOrgs'
};
export const Constants = {
  orgId: '4804'
};
