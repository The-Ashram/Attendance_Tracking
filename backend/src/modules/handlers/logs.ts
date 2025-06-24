import { createObjectCsvStringifier } from "csv-writer";
import { queryGetLogsByDay, queryGetLogsByStartEndDay } from "../../db/queries/logs.query";
import { DatabaseRequestError } from "../../utils/errorTypes";
import { PayloadWithIdDataDate } from "../interfaces/logs.interfaces";
import { getErrorMessage, getErrorName } from "../../utils/errorHandler";

const NAMESPACE = "Logs-Handler";

type event = {
  source: string;
  payload: Object;
};

type eventHandler = (event: event) => Object;

const exportLogsToCSV: eventHandler = async (event) => {
  const { jwtData, date, startDate, endDate } = event.payload as PayloadWithIdDataDate;
  try {
    let logsInDB = null;
    endDate?.setUTCHours(23, 59, 59, 999);  // ensure that query is done for all records on same day
    date?.setUTCHours(23, 59, 59, 999);  // ensure that query is done for all records on same day
    if (date == null) {
      if (startDate == null || endDate == null) {
        throw new DatabaseRequestError("Date or from and to fields cannot be null.", "400");
      } else {
        logsInDB = await queryGetLogsByStartEndDay(startDate.toISOString(), endDate.toISOString());
      }
    } else {
      logsInDB = await queryGetLogsByDay(date.toISOString());
    }

    const csvStringifier = createObjectCsvStringifier({
      header: Object.keys(logsInDB[0]).map((key) => ({ id: key, title: key })),
    });

    // Generate the CSV content
    const csvHeader = csvStringifier.getHeaderString();
    const csvBody = csvStringifier.stringifyRecords(logsInDB);

    // Combine the header and body into a single string
    const csvContent = `${csvHeader}${csvBody}`;

    // Create a dynamic filename based on the date
    let filename = "logs_report.csv";
    if (startDate && endDate) {
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = endDate.toISOString().split("T")[0];
      filename = `logs_report_${formattedStartDate}_${formattedEndDate}.csv`;
    } else if (date) {
      const formattedDate = date.toISOString().split("T")[0];
      filename = `logs_report_${formattedDate}.csv`;
    }

    // Return CSV data as a downloadable response
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
      data: csvContent,
      jwtData: jwtData,
    };
  } catch (error) {
    console.error(NAMESPACE, getErrorMessage(error), error);
    const code = parseInt(getErrorName(error));
    const errorCode = code || 400;
    return {
      statusCode: errorCode,
      error: new Error("CSV export logs failed."),
    };
  }
};

export default {
  exportLogsToCSV,
};