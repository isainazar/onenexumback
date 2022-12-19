const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const cookieSession = require("cookie-session");
require("dotenv").config();
const PROPERTY_ID = process.env.PROPERTY_ID;

// Using a default constructor instructs the client to use the credentials
// specified in GOOGLE_APPLICATION_CREDENTIALS environment variable.
const analyticsDataClient = new BetaAnalyticsDataClient();

// Runs a simple report.
const runReport = async (req, res) => {
  if (req.body.dimension) {
    try {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: "2022-10-31",
            endDate: "today",
          },
        ],

        dimensions: [
          {
            name: req.body.dimension,
          },
        ],
        metrics: [
          /*   {
            name: "active28DayUsers",
          }, */
          {
            name: "sessions",
          },

          {
            name: "eventCountPerUser",
          },

          {
            name: "eventsPerSession",
          },
          {
            name: "totalUsers",
          },

          {
            name: "bounceRate",
          },

          {
            name: "engagedSessions",
          },
        ],
      });

      //console.log(response);
      const obj = [];
      response.rows.forEach((row) => {
        //console.log(row);
        obj.push(row);
      });
      console.log(obj);
      res.status(200).json(obj);
    } catch (error) {
      return res.status(502).json({ error: error });
    }
  } else {
    try {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: "2022-10-31",
            endDate: "today",
          },
        ],

        /*  dimensions: [
          {
            name:'coso',
          },
  
       
        ],  */
        metrics: [
          {
            name: "active28DayUsers",
          },
          {
            name: "sessions",
          },

          {
            name: "eventCountPerUser",
          },

          {
            name: "eventsPerSession",
          },
          {
            name: "totalUsers",
          },

          {
            name: "bounceRate",
          },

          {
            name: "engagedSessions",
          },
        ],
      });

      //console.log(response);
      const obj = [];
      response.rows.forEach((row) => {
        //console.log(row);
        obj.push(row);
      });
      console.log(obj);
      res.status(200).json(obj);
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  }
};

// obtener promedio usuario

const getAvg = async (req, res) => {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: "2022-10-31",
          endDate: "today",
        },
      ],

      dimensions: [
        {
          name: req.body.dimension,
        },
      ],
      metrics: [
        {
          name: "userEngagementDuration",
        },
        {
          name: "activeUsers",
        },
      ],
    });

    const obj = [];
    const path = [];
    response.rows.forEach((row) => {
      obj.push(row);
    });

    for (const dato of obj) {
      let avgTime = dato.metricValues[0].value / dato.metricValues[1].value;
      let min = Math.floor(avgTime / 60);
      let sec = Math.round(avgTime % 60);
      path.push({
        path: dato.dimensionValues[0].value,
        time: `${min}m${sec}s`,
      });
    }

    res.status(200).json(path);
  } catch (error) {
    return res.status(502).json({ error: error });
  }
};
module.exports = {
  runReport,
  getAvg,
};
