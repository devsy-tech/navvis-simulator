import {TemperatureSensor} from "./components/TemperatureSensor";
import http from "http";
import url from "url";
import {connect, MqttClient} from "mqtt";
import {PressureSensor} from "./components/PressureSensor";

// Configure this if you want to serve the app remotely.
const port = process.env.PORT || 3000;

// Replace this field with your MQTT broker address
const dockerAddr = "therare.me";

const mqttPort = 1883;

const client: MqttClient = connect(`http://${dockerAddr}:${mqttPort}`);

const tempSensors: TemperatureSensor[] = [];

const pressureSensors: PressureSensor[] = [];

// Arbitrary sensor ids. In a real system these would be imported externally and would match
// unique identifiers of the sensors.
const tempSensorPoiIds = [1, 2, 3, 4];

const pressureSensorPoiIds = [12, 13, 14, 15];

client.on("connect", () =>
{
	for (let i = 0; i < tempSensorPoiIds.length; i++)
	{
		tempSensors[i] = new TemperatureSensor(tempSensorPoiIds[i], client);
		tempSensors[i].start();
	}
	for (let i = 0; i < pressureSensorPoiIds.length; i++)
	{
		pressureSensors[i] = new PressureSensor(pressureSensorPoiIds[i], client);
		pressureSensors[i].start();
	}
});

const server = http.createServer((req, res) =>
{
	const reqUrl = url.parse(req.url, true);
	res.statusCode = 200;
	res.setHeader("Access-Control-Allow-Origin", "*");

	if (reqUrl.pathname === "/temperature")
	{
		// Endpoint to request historical data of the temperature sensors
		if (reqUrl.query.id)
		{
			const tempSensorIndex = tempSensorPoiIds.findIndex(
				(id) => id.toString() === reqUrl.query.id);
			if (tempSensorIndex === -1)
			{
				res.statusCode = 404;
				res.setHeader("Content-Type", "text/plain");
				res.end("Sensor not found!");
			}
			else
			{
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				const historicalData = tempSensors[tempSensorIndex].historicalData;
				res.end(JSON.stringify(historicalData));
			}

		}
		// Endpoint to request ids of the temperature sensors
		else
		{
			res.statusCode = 200;
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify(tempSensorPoiIds));
		}
	}
	else if (reqUrl.pathname === "/pressure")
	{
		// Endpoint to request historical data of the pressure sensors
		if (reqUrl.query.id)
		{
			const pressureSensorIndex = pressureSensorPoiIds.findIndex(
				(id) => id.toString() === reqUrl.query.id);
			if (pressureSensorIndex === -1)
			{
				res.statusCode = 404;
				res.setHeader("Content-Type", "text/plain");
				res.end("Sensor not found!");
			}
			else
			{
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				const historicalData = pressureSensors[pressureSensorIndex].historicalData;
				res.end(JSON.stringify(historicalData));
			}

		}
		// Endpoint to request ids of the pressure sensors
		else
		{
			res.statusCode = 200;
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify(pressureSensorPoiIds));
		}
	}
	else
	{
		res.statusCode = 200;
		res.setHeader("Content-Type", "text/plain");
		res.end("Hello World\n");
	}
});

server.listen(port, () =>
{
	console.log(`Server running at ${port}`);
});
