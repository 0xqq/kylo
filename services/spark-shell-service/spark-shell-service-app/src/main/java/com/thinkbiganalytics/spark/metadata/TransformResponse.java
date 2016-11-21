package com.thinkbiganalytics.spark.metadata;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.thinkbiganalytics.db.model.query.QueryResult;

/**
 * The result of a Spark transformation.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TransformResponse {

    /**
     * Success status of a transformation.
     */
    public enum Status {
        /** Transformation resulted in an error */
        ERROR,

        /** Transformation is in-progress */
        PENDING,

        /** Transformation was successful */
        SUCCESS;

        @Override
        public String toString() {
            return super.toString().toLowerCase();
        }
    }

    /** Error message */
    private String message;

    /** Progress of the transformation */
    private Double progress;

    /** Result of a transformation */
    private QueryResult results;

    /** Success status of a transformation */
    private Status status;

    /** Table name with the results */
    private String table;

    /**
     * Gets the error message.
     *
     * @return the error message
     */
    public String getMessage() {
        return message;
    }

    /**
     * Sets the error message.
     *
     * @param message the error message
     */
    public void setMessage(String message) {
        this.message = message;
    }

    /**
     * Gets the progress of the transformation.
     *
     * @return the transformation progress
     */
    public Double getProgress() {
        return progress;
    }

    /**
     * Sets the progress of the transformation.
     *
     * @param progress the transformation progress
     */
    public void setProgress(Double progress) {
        this.progress = progress;
    }

    /**
     * Gets the results of this transformation.
     *
     * @return the results
     */
    public QueryResult getResults() {
        return results;
    }

    /**
     * Sets the results of this transformation.
     *
     * @param results the results
     */
    public void setResults(QueryResult results) {
        this.results = results;
    }

    /**
     * Gets the status of this transformation.
     *
     * @return the status
     */
    public Status getStatus() {
        return status;
    }

    /**
     * Sets the status of this transformation.
     *
     * @param status the status
     */
    public void setStatus(Status status) {
        this.status = status;
    }

    /**
     * Gets the table with the results.
     *
     * @return the table name
     */
    public String getTable() {
        return table;
    }

    /**
     * Sets the table with the results.
     *
     * @param table the table name
     */
    public void setTable(String table) {
        this.table = table;
    }
}