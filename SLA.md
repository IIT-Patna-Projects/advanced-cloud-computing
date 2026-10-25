# SLA Definitions (Hypotheses)

All targets below are proposed hypotheses. They are not measured results
and will be validated by the experiments.

| Measure | Hypothesis | How we will check it |
|---|---|---|
| Availability | At least 99.5% in the test window | Share of successful responses during the load test |
| P95 API latency | Under 500 ms at baseline | Baseline Locust run |
| Error rate | Under 1% at normal load | Baseline Locust run |
| Scale-out trigger | CPU above 70% for 3 minutes (initial hypothesis) | CloudWatch alarm during the burst test |
| TTR | Under 2 minutes for the chosen failure scenario | Failure-recovery experiment |

## TTR definition
TTR = time restoration is verified - time incident started

Workflow: Detect, Diagnose, Recover, Verify.

## Status
Results: to be recorded after the experiments.
