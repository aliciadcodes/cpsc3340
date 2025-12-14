import asyncio
import websockets
import json

connected_clients = set()

async def handler(websocket):
    print("connected")
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            pass
    except websockets.ConnectionClosed:
        pass
    finally:
        connected_clients.remove(websocket)

async def broadcast(sensor, distance):
    if connected_clients:
        message = json.dumps({
            "sensor": sensor,
            "distance": distance
        })
        await asyncio.gather(
            *[ws.send(message) for ws in connected_clients]
        )

async def tcp_server():
    server = await asyncio.start_server(handle_tcp, "0.0.0.0", 8888)
    async with server:
        await server.serve_forever()

async def handle_tcp(reader, writer):
    while True:
        data = await reader.readline()
        if not data:
            break
        message = data.decode().strip()
        try:
            sensor, distance = message.split(":")
            sensor = sensor.strip()
            distance = float(distance.strip())
            await broadcast(sensor, distance)
        except Exception as e:
            print("error:", e)
    writer.close()
    await writer.wait_closed()

async def main():
    ws_server = await websockets.serve(handler, "0.0.0.0", 8889)
    await asyncio.gather(ws_server.wait_closed(), tcp_server())

asyncio.run(main())