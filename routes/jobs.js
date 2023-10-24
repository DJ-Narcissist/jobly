"use strict";
/** Routes  for jobs */

const jsonschema = require("jsonschema");
const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const jobSearchSchema = require("../schemas/jobSearch.json");

const router = express.Router({ mergeParams: true });

/**POST / { job } => { job } 
 * 
 * job should be  { title, salary, equity, companyHandle }
 * 
 * Returns { id, title, salary, equity, companyHandle }
 * 
 * admin authorization
 *
 *  
 **/

router.post("/", ensureAdmin, async (req, res, next) => {
    try{
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    }   catch(err){
        return next(err);
    }
});

/** GET/ => { jobs: [{ id, title, salary, equity, companyHandle, comapnyName}, ...] } 
 * 
 * search filter in query:
 * -minSalary
 * -hasEquity
 * -title
 * No authorization
**/

router.get("/", async(req,res, next) => {
    const q = req.query;
    // arrive as string from querystring, but want it as interger/ boolean
    if (q.minSalary !==undefined) q.minSalary = +q.minSalary;
    q.hasEquity = q.hasEquity === "true";

    try{
        const validator = jsonschema.validate(q, jobSearchSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const jobs = await Job.findAll(q);
        return res.json({ jobs });
    }   catch(err){
        return next(err);
    }
});

/** GET/ [jobId] => { job }
 * 
 * Returns { id, title, salary, equity, company }
 *  where company is { handle, name, description, numEmployees, logoUrl }
 * 
 * no Authorization
 */

router.get("/:id", async (req,res,next) => {
    try {
        const job = await Job.get(req.params.id);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

/**PATCH/[jobId] {fld1,fld2,...} => { job } 
 * Data: {title, salary, equity}
 * Returns {id, salary, title, equity, companyHandle}
**/

router.patch("/:id", ensureAdmin, async (req,res,next) => {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });
    }   catch (err) {
        return next(err);
    }
});

/**DELETE/[handle] => { delete: id }
 * no authorization
**/

router.delete("/:id", ensureAdmin, async (req,res,next) => {
    try {
        await Job.remove(req.params.id);
        return res.json({ deletes: +req.params.id });
    }   catch(err) {
        returnnext(err);
     }
});

module.exports = router;


