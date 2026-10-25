## Teardown checklist (run after every experiment)
1. Stop the load test and confirm no traffic is running.
2. Set the Auto Scaling Group desired capacity to 0, then delete it.
3. Delete the load balancer and its target group.
4. Terminate remaining EC2 instances.
5. Delete unattached EBS volumes and old snapshots.
6. Delete or snapshot the RDS database, then delete the instance and its automated backups.
7. Delete unused images in ECR.
8. Delete NAT gateways, if any were created.
9. Release unused Elastic IP addresses.
10. Delete CloudWatch alarms, dashboards and unneeded log groups.
11. Check data transfer charges on the AWS Billing page.
12. Check the Budget alert for unexpected charges, then record the result in the cost table.
