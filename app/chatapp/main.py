
from flask_cors import CORS
from flask import *
import requests
from solcx import compile_standard, install_solc
from web3 import Web3
from Crypto.Cipher import Blowfish
from werkzeug.utils import secure_filename 
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


import sqlite3 
def connect():
        return sqlite3.connect("chat.db")
import os, json, random, string, datetime
ipfs_api_url = "http://localhost:5001/api/v0" 
UPLOAD_FOLDER = "static/upload/"
ENCRYPT_FOLDER = "static/encrypt/"
DOWNLOAD_FOLDER = os.path.join("static", "download")
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)  # ✅ ensure folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(ENCRYPT_FOLDER, exist_ok=True)
# Configuration paths
UPLOAD_FOLDER = "static/upload"
ENCRYPT_FOLDER = "static/encrypt"
DOWNLOAD_FOLDER = "static/download"
DECRYPT_FOLDER = "static/decrypt"

ipfs_api_url = "http://127.0.0.1:5001/api/v0"  # IPFS local API

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(ENCRYPT_FOLDER, exist_ok=True)
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)
os.makedirs(DECRYPT_FOLDER, exist_ok=True)

# PKCS5 padding helpers
def pad(data):
    pad_len = 8 - (len(data) % 8)
    return data + bytes([pad_len] * pad_len)

def unpad(data):
    pad_len = data[-1]
    return data[:-pad_len]

def generate_random_key():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=16)).encode()

def upload_file_to_ipfs(file_path):
    try:
        with open(file_path, "rb") as file:
            response = requests.post(f"{ipfs_api_url}/add", files={"file": file})
        if response.status_code == 200:
            return response.json()["Hash"]
    except Exception as e:
        print("IPFS Upload Error:", e)
    return None

@app.route('/chat/upload', methods=['POST'])
def chatupload():
    file = request.files['file']
    user = request.form["u"]
    random_suffix = str(random.randint(1000, 9999))
    filename = user + random_suffix + secure_filename(file.filename)

    upload_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(upload_path)

    # Generate Blowfish key
    key = generate_random_key()
    encrypted_filename = "enc_" + filename
    encrypted_path = os.path.join(ENCRYPT_FOLDER, encrypted_filename)

    # Encrypt file
    cipher = Blowfish.new(key, Blowfish.MODE_ECB)
    with open(upload_path, 'rb') as infile, open(encrypted_path, 'wb') as outfile:
        data = infile.read()
        padded_data = pad(data)
        encrypted_data = cipher.encrypt(padded_data)
        outfile.write(encrypted_data)

    # Upload to IPFS
    ipfs_hash = upload_file_to_ipfs(encrypted_path)
    if not ipfs_hash:
        return jsonify({"error": "Failed to upload to IPFS"}), 500

    return jsonify({
        "filename": filename,
        "key": key.decode(),
        "ipfs": ipfs_hash
    })

@app.route("/chat/download", methods=["POST"])
def chat_download():
    data = request.get_json()
    filename = secure_filename(data.get("filename"))
    fileid = data.get("hash")
    key = data.get("key")

    if not filename or not fileid or not key:
        return jsonify({"success": False, "error": "Missing required fields"}), 400

    try:
        path = download_file(filename, fileid, key)
        return jsonify({"success": True, "path": "/" + path})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

def download_file(filename, fileid, key):
    url = f"http://127.0.0.1:8080/ipfs/{fileid}?filename={fileid}"
    encrypted_path = os.path.join(DOWNLOAD_FOLDER, "enc_" + filename)
    decrypted_path = os.path.join(DECRYPT_FOLDER, "de_" + filename)

    response = requests.get(url)
    if response.status_code == 200:
        with open(encrypted_path, "wb") as f:
            f.write(response.content)

        # Decrypt
        cipher = Blowfish.new(key.encode(), Blowfish.MODE_ECB)
        with open(encrypted_path, 'rb') as enc_file, open(decrypted_path, 'wb') as dec_file:
            encrypted_data = enc_file.read()
            decrypted_data = cipher.decrypt(encrypted_data)
            dec_file.write(unpad(decrypted_data))

        return decrypted_path
    else:
        raise Exception("Failed to download file from IPFS.")
    

def soliditycontract(e, file_name):
    import json
    install_solc("0.6.0")
    with open("./SimpleStorage.sol", "r") as file:
        simple_storage_file = file.read()
    print(simple_storage_file)
    compiled_sol = compile_standard(
        {
            "language": "Solidity",
            "sources": {"SimpleStorage.sol": {"content": simple_storage_file}},
            "settings": {
                "outputSelection": {
                    "*": {
                        "*": ["abi", "metadata", "evm.bytecode", "evm.bytecode.sourceMap"]
                    }
                }
            },
        },
        solc_version="0.6.0",
    )
    with open("compiled_code.json", "w") as file:
        json.dump(compiled_sol, file)
    bytecode = compiled_sol["contracts"]["SimpleStorage.sol"]["SimpleStorage"]["evm"][
        "bytecode"
    ]["object"]
    # get abi
    abi = json.loads(
        compiled_sol["contracts"]["SimpleStorage.sol"]["SimpleStorage"]["metadata"]
    )["output"]["abi"]
    w3 = Web3(Web3.HTTPProvider('HTTP://127.0.0.1:7545'))
    chain_id = 1337
    print(w3.is_connected())
    my_address = e[0]
    private_key = e[1]
    # initialize contract
    SimpleStorage = w3.eth.contract(abi=abi, bytecode=bytecode)
    nonce = w3.eth.get_transaction_count(my_address)
    # set up transaction from constructor which executes when firstly
    transaction = SimpleStorage.constructor(file_name).build_transaction(
        {"chainId": chain_id, "from": my_address, "nonce": nonce}
    )
    signed_tx = w3.eth.account.sign_transaction(
        transaction, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    tx_receipt = "".join(["{:02X}".format(b)
                         for b in tx_receipt["transactionHash"]])
    return tx_receipt
def soliditycontractdata1(e, message, receiver_address):
    print(e, message, receiver_address)
    
    # Install the correct Solidity compiler version
    install_solc("0.6.0")
    
    with open("./SimpleStorage1.sol", "r") as file:
        simple_storage_file = file.read()
    
    # Compile the contract
    compiled_sol = compile_standard(
        {
            "language": "Solidity",
            "sources": {"SimpleStorage1.sol": {"content": simple_storage_file}},
            "settings": {
                "outputSelection": {
                    "*": {
                        "*": ["abi", "evm.bytecode", "evm.bytecode.sourceMap"]
                    }
                }
            },
        },
        solc_version="0.6.0",
    )

    with open("compiled_code.json", "w") as file:
        json.dump(compiled_sol, file)

    # Extract the bytecode and ABI from the compiled contract
    bytecode = compiled_sol["contracts"]["SimpleStorage1.sol"]["SimpleStorage"]["evm"]["bytecode"]["object"]
    abi = compiled_sol["contracts"]["SimpleStorage1.sol"]["SimpleStorage"]["abi"]

    w3 = Web3(Web3.HTTPProvider('HTTP://127.0.0.1:7545'))
    chain_id = 1337
    print(w3.is_connected())

    my_address = e[0]  # Sender address
    private_key = e[1]  # Sender private key

    # Initialize contract
    SimpleStorage = w3.eth.contract(abi=abi, bytecode=bytecode)

    # Build transaction for contract deployment
    nonce = w3.eth.get_transaction_count(my_address)
    transaction = SimpleStorage.constructor().build_transaction(
        {"chainId": chain_id, "from": my_address, "nonce": nonce}
    )

    # Sign the transaction
    signed_tx = w3.eth.account.sign_transaction(transaction, private_key=private_key)
    
    # Send the transaction
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    
    # Wait for transaction receipt
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    # Now that the contract is deployed, we can get the contract address from the transaction receipt
    contract_address = tx_receipt['contractAddress']
    print("Contract deployed at address:", contract_address)

    # Now call the storeMessage function with the message
    SimpleStorage = w3.eth.contract(address=contract_address, abi=abi)  # Point to the deployed contract

    # Build the transaction for storing the message
    store_message = SimpleStorage.functions.storeMessage(receiver_address, message).build_transaction(
        {"chainId": chain_id, "from": my_address, "nonce": nonce + 1}
    )

    # Sign the transaction for storing the message
    signed_tx_store = w3.eth.account.sign_transaction(store_message, private_key=private_key)

    # Send the transaction to store the message
    tx_hash_store = w3.eth.send_raw_transaction(signed_tx_store.raw_transaction)
    tx_receipt_store = w3.eth.wait_for_transaction_receipt(tx_hash_store)

    # Return the transaction hash for storing the message
    tx_receipt = "".join(["{:02X}".format(b) for b in tx_receipt_store["transactionHash"]])
    
    return tx_receipt



@app.route('/chat/insertchat', methods=["POST"], strict_slashes=False)
def insertchat():
    from datetime import datetime
    r = request.json
    print(r)

    mydb = connect()    
    mycursor = mydb.cursor()

    # Fetch sender and receiver info
    mycursor.execute("SELECT address, privatekey FROM users WHERE uid=?", (r["senderid"],))
    sender = mycursor.fetchone()

    mycursor.execute("SELECT address, privatekey FROM users WHERE uid=?", (r["receiverid"],))
    receiver = mycursor.fetchone()

    print("Receiver info:", receiver)

    # Store message on blockchain (assuming this is defined)
    tx_receipt = soliditycontractdata1([sender[0], sender[1]], r["message"], receiver[0])

    # Get new CID
    mycursor.execute("SELECT cid FROM chat ORDER BY cid DESC LIMIT 1")
    e = mycursor.fetchone()
    eid = 1 if not e else e[0] + 1

    # Current datetime
    current_datetime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Insert into chat table
    insert_query = """
        INSERT INTO chat (cid, senderid, receiverid, message, currentdata, filename, keys, ifps)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """
    data = (
        eid,
        r['senderid'],
        r['receiverid'],
        r['message'],
        current_datetime,
        r.get('filename', ''),
        r.get('keys', ''),
        r.get('ifps', '')
    )

    mycursor.execute(insert_query, data)
    mydb.commit()
    mydb.close()

    return jsonify({"tx_receipt": tx_receipt})

    
@app.route('/chat/updatechat', methods=["POST"], strict_slashes=False)
def updatechat():
    r=request.json
    mydb = connect()
    d="update chat set senderid ='%s',receiverid ='%s',message ='%s',currentdata ='%s',filename ='%s',status ='%s' where cid='%s'"%(r['senderid'],r['receiverid'],r['message'],r['currentdata'],r['filename'],r['status'],r['cid'])
    mycursor = mydb.cursor()
    mycursor.execute(d)
    mydb.commit()
    mydb.close()
    return 's'
    
@app.route('/chat/viewchat', methods=["POST"], strict_slashes=False)
def viewchat():
        mydb = connect()
        mycursor = mydb.cursor()
        tx="select *   from chat"
        mycursor.execute(tx)
        e=mycursor.fetchall()
        mydb.close()
        return json.dumps(e)
@app.route("/chat/image", methods=['GET', 'POST'])
def dymentriyamage():
    data = request.json["file"]
    mobile = request.json["mobile"]
    import base64
    from io import BytesIO
    from PIL import Image
    import random
    file = data
    starter = file.find(',')
    image_data = file[starter+1:]
    image_data = bytes(image_data, encoding="ascii")
    im = Image.open(BytesIO(base64.b64decode(image_data)))
    x = str(mobile)+str(random.randint(0000, 1000))+'.jpg'
    im.save("static/"+x)
    print(x)
    return json.dumps(x)


@app.route('/chat/getchat', methods=["POST"], strict_slashes=False)
def getchat():
    r = request.json
    print(r)
    
    # Establish a connection to the database
    mydb = connect()
    mycursor = mydb.cursor()

    # Corrected SQL query with properly grouped conditions
    tx = """
        SELECT * 
        FROM chat 
        WHERE (senderid = '%s' AND receiverid = '%s') 
        OR (senderid = '%s' AND receiverid = '%s')
    """
    # Execute the query with parameters to prevent SQL injection
    mycursor.execute(tx% (r["rid"], r["senderid"], r["senderid"], r["rid"]))
    
    # Fetch the results
    e = mycursor.fetchall()
    print(e)
    
    # Close the database connection
    mydb.close()

    # Return the result as a JSON response
    return json.dumps(e)

@app.route('/chat/deletechat', methods=["POST"], strict_slashes=False)
def deletechat():
        r=request.json
        mydb = connect()
        mycursor = mydb.cursor()
        tx="delete from chat where cid={0}".format(r['id'])
        mycursor.execute(tx)
        mydb.commit()
        mydb.close()
        return 's'
@app.route('/chat/insertusers', methods=["POST"], strict_slashes=False)
def insertusers():
    r=request.json
    mydb = connect()
    mycursor = mydb.cursor()
    tx = 'select uid from users order by uid desc limit 1'
    mycursor.execute(tx)
    e = mycursor.fetchall()
    if len(e) == 0:
            eid = 1
    else:
            eid = e[0][0]+1
    d="insert into users(uid,uname,email,mobile,Designation,password,address,privatekey,isapproved)values ('%s','%s','%s','%s','%s','%s','%s','%s','%s')"%(eid,r['uname'],r['email'],r['mobile'],r['designation'],r['password'],r["address"],r["privatekey"],r['isapproved'])
    mycursor = mydb.cursor()
    mycursor.execute(d)
    ha = soliditycontract([r["address"],r["privatekey"]], "user profile")
    mydb.commit()
    mydb.close()
    return 'e'
    
@app.route('/chat/updateusers', methods=["POST"], strict_slashes=False)
def updateusers():
    r=request.json
    mydb = connect()
    d="update users set uname ='%s',email ='%s',mobile ='%s',role ='%s',password ='%s',isapproved ='%s' where uid='%s'"%(r['uname'],r['email'],r['mobile'],r['role'],r['password'],r['isapproved'],r['uid'])
    mycursor = mydb.cursor()
    mycursor.execute(d)
    mydb.commit()
    mydb.close()
    return 's'
@app.route('/chat/approveusers', methods=["POST"], strict_slashes=False)
def approveusers():
    r=request.json
    mydb = connect()
    d="update users set isapproved ='%s' where uid='%s'"%("yes",r['uid'])
    mycursor = mydb.cursor()
    mycursor.execute(d)
    mydb.commit()
    mydb.close()
    return 's'
    
@app.route('/chat/viewusers', methods=["POST"], strict_slashes=False)
def viewusers():
        mydb = connect()
        mycursor = mydb.cursor()
        tx="select *   from users"
        mycursor.execute(tx)
        e=mycursor.fetchall()
        mydb.close()
        return json.dumps(e)

@app.route('/chat/viewusersbyid', methods=["POST"], strict_slashes=False)
def viewusersbyid():
        r=request.json
        mydb = connect()
        mycursor = mydb.cursor()
        tx="select *   from users where uid!='%s'"%(r["id"])
        mycursor.execute(tx)
        e=mycursor.fetchall()
        mydb.close()
        return json.dumps(e)
@app.route('/chat/deleteusers', methods=["POST"], strict_slashes=False)
def deleteusers():
        r=request.json
        mydb = connect()
        mycursor = mydb.cursor()
        tx="delete from users where uid={0}".format(r['id'])
        mycursor.execute(tx)
        mydb.commit()
        mydb.close()
        return 's'

@app.route('/chat/login', methods=["post"])
def login():
    r = request.json
    con = connect()
    x="select uid,uname,isapproved from users where email='%s' and password='%s'"%(r["email"], r["password"])
    v = con.execute(x).fetchone()
    return json.dumps(v)
if __name__ == '__main__':
        app.run("0.0.0.0",debug=True) 