### What's new

>12.07.2017

API methods done.

- Added scheduler to create temporary table (group to forum id, moaf_group_to_forum).
- This table speeds up execution of complicated sql queries 5 to 15 times instead of group and post metadata join
- Substitute joins with simple comparisons (1.2 - 1.7 times benefit)

>17.07.2017

- Added keys creation. Server can work as standalone https server
- MOAF startup init.d script added