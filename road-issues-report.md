# GeoJSON Roads Analysis Report

## Summary

- **Total Features**: 222
- **Roads (with from/to)**: 68
- **Nodes**: 0 (nodes are likely represented as other feature types)
- **Other Features**: 154

## Critical Issues Found

### 1. Duplicate Road Name: RD52

There are **TWO roads** with the name "RD52" in the GeoJSON file:

**First RD52** (Line ~3963):
- From: `IT_11`
- To: `RD_CLINIC`
- This appears to be the correct RD52

**Second RD52** (Line ~4476):
- From: `RD_UCLM_POOL`
- To: `RD_Seamanship_Lab`
- **This should likely be RD62** based on the sequence

**Impact**: This duplicate causes confusion in the road graph and may cause routing issues if both roads exist in the same path.

**Recommended Fix**: Rename the second RD52 (UCLM_POOL → Seamanship_Lab) to **RD62**

---

### 2. Missing Road: RD20

The sequence RD19 → RD21 → RD22 exists, but **RD20 is missing**.

Current roads around this area:
- RD19: `RD_ANNEX2_STAIRS2` → `IT_5`
- **RD20**: MISSING
- RD21: `IT_5` → `IT_8`
- RD22: `IT_5` → `IT_7`

**Possible scenarios**:
1. RD20 was intentionally removed/deleted
2. RD20 was never created
3. RD20 exists but wasn't properly added to the GeoJSON

**Impact**: Gap in road numbering sequence. This is mainly a naming/organizational issue and doesn't affect functionality if the physical road connections are complete.

---

### 3. Missing Road: RD41 vs RD_41

The analysis shows RD41 as missing, but there's actually a road named **"RD_41"** (with underscore):
- Name: `RD_41`
- From: `IT_9`
- To: `RD_TextbookSec`

**Impact**: Naming inconsistency - all other roads use format "RD##" without underscore.

**Recommended Fix**: Rename `RD_41` to `RD41` for consistency

---

## Complete Road List (68 roads)

### Roads RD1-RD10
1. RD1: Gate1_RoadEnd → OldBuildingIntersection
2. RD2: OldBuildingIntersection → RE_stairs_uro_old
3. RD3: OldBuildingIntersection → Stairs1OldRoadEnd
4. RD4: OldBuildingIntersection → IT_Gate2
5. RD5: IT_Gate2 → RD_prefect_discipline
6. RD6: IT_Gate2 → IT_Gate3
7. RD7: OldBuildingIntersection → RD_Gate2
8. RD8: IT_Gate3 → RD_Gate3
9. RD9: IT_Gate3 → RD_SAOStairs
10. RD10: IT_Gate3 → IT_1

### Roads RD11-RD20
11. RD11: IT_1 → RD_StudyHall
12. RD12: IT_1 → RD_ANNEX2_STAIRS1
13. RD13: RD_ANNEX2_STAIRS1 → RD_SOCIAL_HALL
14. RD14: RD_SOCIAL_HALL → IT_4
15. RD15: IT_4 → RD_Gate4
16. RD16: IT_4 → RD_ANNEX2_STAIRS2
17. RD17: IT_4 → RD_ROBOTICS_LAB
18. RD18: RD_ROBOTICS_LAB → RD_ANNEX2_STAIRS2
19. RD19: RD_ANNEX2_STAIRS2 → IT_5
20. **RD20: MISSING**

### Roads RD21-RD30
21. RD21: IT_5 → IT_8
22. RD22: IT_5 → IT_7
23. RD23: RD_StudyHall → RD_AnnexStairs
24. RD24: RD_AnnexStairs → RD_ANNEXElevatorr
25. RD25: RD_ANNEXElevatorr → IT_2
26. RD26: IT_2 → RD_AnnexCanteen
27. RD27: IT_2 → IT_3
28. RD28: IT_3 → RD_Gate5
29. RD29: IT_3 → RD_CASHIER_ACC_RECORDS
30. RD30: RD_CASHIER_ACC_RECORDS → RD_EDP_SECTION

### Roads RD31-RD40
31. RD31: RD_EDP_SECTION → RD_BASICED_BLDG
32. RD32: RD_BASICED_BLDG → IT_6
33. RD33: IT_6 → RD_Gate6
34. RD34: IT_6 → IT_7
35. RD35: IT_7 → IT_yes
36. RD36: IT_yes → IT_Yesser
37. RD37: IT_Yesser → IT_11
38. RD38: IT_8 → RD_foodcourt
39. RD39: IT_8 → RD_PE_FACULTY
40. RD40: RD_PE_FACULTY → IT_9

### Roads RD41-RD50
41. **RD_41**: IT_9 → RD_TextbookSec (inconsistent naming)
42. RD42: IT_9 → IT_10
43. RD43: IT_10 → RD_COVERED_COURT
44. RD44: IT_10 → RD_Chapel
45. RD45: RD_Chapel → IT_11
46. RD46: RD_COVERED_COURT → IT_13
47. RD47: IT_12 → IT_12 (self-loop)
48. RD48: IT_13 → IT_14
49. RD49: IT_14 → RD_MACHINE_SHOP
50. RD50: IT_14 → RD_UCLM_POOL

### Roads RD51-RD60
51. RD51: RD_UCLM_POOL → RD_MACHINE_SHOP
52. RD52: IT_11 → RD_CLINIC
53. **RD52 (DUPLICATE)**: RD_UCLM_POOL → RD_Seamanship_Lab
54. RD53: RD_CLINIC → RD_Cb1Cb2
55. RD54: RD_Cb1Cb2 → RD_NSAOFFICE
56. RD55: RD_NSAOFFICE → IT_12
57. RD56: IT_12 → RD_gate_7
58. RD57: IT_12 → IT_Gate2
59. RD58: IT_12 → RD_GUIDANCE
60. RD59: RD_nsa_dorm_canteen → RD_GUIDANCE

### Roads RD61-RD68
61. RD60: RD_GUIDANCE → RD_ToolRoomME
62. RD61: RD_ToolRoomME → RD_CBECanteen
63. **RD62: MISSING** (should be UCLM_POOL → Seamanship_Lab)
64. RD63: RD_CBECanteen → IT_15
65. RD64: IT_15 → RD_gate_8
66. RD65: IT_15 → IT_16
67. RD66: IT_16 → RD_cbe_elevator
68. RD67: IT_16 → cbe_gate9_elevator
69. RD68: cbe_gate9_elevator → RD_Gate9

### Special Roads
- **"Intersection to East"**: Stairs1OldRoadEnd → main_stairs_oldRoad_end

---

## Terminal Nodes (Dead Ends)

The following 19 nodes only have **one connection** (potential dead ends):

1. main_stairs_oldRoad_end (via Intersection to East)
2. RD_TextbookSec (via RD_41)
3. Gate1_RoadEnd (via RD1)
4. RE_stairs_uro_old (via RD2)
5. RD_prefect_discipline (via RD5)
6. RD_Gate2 (via RD7)
7. RD_Gate3 (via RD8)
8. RD_SAOStairs (via RD9)
9. RD_AnnexCanteen (via RD26)
10. RD_Gate5 (via RD28)
11. RD_Gate6 (via RD33)
12. RD_Gate4 (via RD15)
13. RD_gate_7 (via RD56)
14. RD_nsa_dorm_canteen (via RD59)
15. RD_foodcourt (via RD38)
16. RD_Seamanship_Lab (via RD52-duplicate)
17. RD_gate_8 (via RD64)
18. RD_cbe_elevator (via RD66)
19. RD_Gate9 (via RD68)

**Note**: Most gates and destinations should be terminal nodes, so this is expected behavior.

---

## Recommended Actions

### Priority 1: Fix Duplicate RD52
1. Locate the second RD52 (RD_UCLM_POOL → RD_Seamanship_Lab) in the GeoJSON
2. Rename it to **RD62**
3. Verify the change doesn't break any existing routes

### Priority 2: Fix Naming Inconsistency
1. Rename **RD_41** to **RD41** for consistency

### Priority 3: Investigate RD20
1. Determine if RD20 was intentionally omitted
2. If needed, create RD20 or document why it's skipped

---

## Graph Statistics

- **Total Nodes**: 63
- **Total Roads**: 68
- **Terminal Nodes**: 19
- **Average Connections per Node**: ~2.0
- **Longest Road Sequence**: RD1 to RD68 (with gaps at RD20, RD62)

---

## Conclusion

The road network is mostly well-structured, but the **duplicate RD52** is the most critical issue that could cause routing problems. The missing RD20 and RD62 appear to be numbering gaps that should be filled for better organization.

The graph shows good connectivity with 63 nodes connected by 68 roads, forming a complete navigable network across the campus.
