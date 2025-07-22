pragma solidity >= 0.8.11 <= 0.8.11;
pragma experimental ABIEncoderV2;
//evault solidity code
contract Healthcare {

    uint public userCount = 0; 
    mapping(uint => user) public userList; 
     struct user
     {
       string username;
       string password;
       string phone;
       string email;
       string home_address;
       string desc;
       string usertype;
     }
 
   // events 
   event userCreated(uint indexed _userId);
   
   //function  to save user details to Blockchain
   function saveUser(string memory uname, string memory pass, string memory phone, string memory emailid, string memory homes_address, string memory desc, string memory utype) public {
      userList[userCount] = user(uname, pass, phone, emailid, homes_address, desc, utype);
      emit userCreated(userCount);
      userCount++;
    }

     //get user count
    function getUserCount()  public view returns (uint) {
          return  userCount;
    }

    uint public ehrCount = 0; 
    mapping(uint => ehr) public ehrList; 
     struct ehr
     {
       string username;
       string doctorname;
       string disease_details;
       string report;
       string prescription;
       string ehr_date;       
     }
 
   // events 
   event ehrCreated(uint indexed _ehrId);
   
   //function  to save EHR details to Blockchain
   function saveEhr(string memory uname, string memory doctor, string memory disease, string memory report, string memory pres, string memory edate) public {
      ehrList[ehrCount] = ehr(uname, doctor, disease, report, pres, edate);
      emit ehrCreated(ehrCount);
      ehrCount++;
    }

    function updatePrescription(uint i, string memory pres) public { 
      ehrList[i].prescription = pres;
   }

     //get ehr count
    function getEhrCount()  public view returns (uint) {
          return  ehrCount;
    }

    function getUsername(uint i) public view returns (string memory) {
        user memory doc = userList[i];
	return doc.username;
    }

    function getPassword(uint i) public view returns (string memory) {
        user memory doc = userList[i];
	return doc.password;
    }

    function getPhone(uint i) public view returns (string memory) {
        user memory doc = userList[i];
	return doc.phone;
    }

   
    function getEmail(uint i) public view returns (string memory) {
        user memory doc = userList[i];
	return doc.email;
    }

    function getAddress(uint i) public view returns (string memory) {
        user memory doc = userList[i];
	return doc.home_address;
    }

    function getDescription(uint i) public view returns (string memory) {
        user memory doc = userList[i];
	return doc.desc;
    }

    function getUserType(uint i) public view returns (string memory) {
        user memory doc = userList[i];
	return doc.usertype;
    }

    function getPatient(uint i) public view returns (string memory) {
        ehr memory doc = ehrList[i];
	return doc.username;
    }

    function getDoctor(uint i) public view returns (string memory) {
        ehr memory doc = ehrList[i];
	return doc.doctorname;
    }

    function getDisease(uint i) public view returns (string memory) {
        ehr memory doc = ehrList[i];
	return doc.disease_details;
    }

    function getReport(uint i) public view returns (string memory) {
        ehr memory doc = ehrList[i];
	return doc.report;
    }

    function getPrescription(uint i) public view returns (string memory) {
        ehr memory doc = ehrList[i];
	return doc.prescription;
    }

    function getEhrDate(uint i) public view returns (string memory) {
        ehr memory doc = ehrList[i];
	return doc.ehr_date;
    }    
}