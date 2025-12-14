import socket

HOST = ''  # listen on all interfaces
PORT = 8888

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind((HOST, PORT))
    s.listen()
    print(f"Server listening on port {PORT}")

    while True:
        conn, addr = s.accept()
        print(f"Connected by {addr}")
        with conn:
            while True:
                data = conn.recv(1024)
                if not data:
                    print(f"Connection closed by {addr}")
                    break
                print(f"Received: {data.decode().strip()}")
                conn.sendall(b'ACK')