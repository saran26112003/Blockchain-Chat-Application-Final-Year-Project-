pragma solidity ^0.6.0;

contract SimpleStorage {
    struct Message {
        address sender;
        address receiver;
        string message;
        uint timestamp;
    }

    Message[] public messages;

    // Store the message
    function storeMessage(address _receiver, string memory _message) public {
        Message memory newMessage = Message({
            sender: msg.sender,
            receiver: _receiver,
            message: _message,
            timestamp: block.timestamp
        });

        messages.push(newMessage);
    }

    // Function to get a specific message
    function getMessage(uint index) public view returns (address sender, address receiver, string memory message, uint timestamp) {
        Message memory msgData = messages[index];
        return (msgData.sender, msgData.receiver, msgData.message, msgData.timestamp);
    }

    // Function to get the number of stored messages
    function getMessageCount() public view returns (uint) {
        return messages.length;
    }
}
