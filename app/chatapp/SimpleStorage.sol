pragma solidity ^0.6.0;

contract SimpleStorage {
    string public fileName;

    constructor(string memory _fileName) public {
        fileName = _fileName;
    }

    function setFileName(string memory _newFileName) public {
        fileName = _newFileName;
    }
}