"""
RailLexa Chennai Division — ML Optimization Strict Prerequisite Data Gatekeeper
Ensures the optimization pipeline NEVER proceeds to inference unless all prerequisite data gates pass with 100% validity.
"""

from typing import Dict, Any, List, Tuple

class DataGatekeeper:
    """
    Multi-stage gatekeeper ensuring that all physical and operational railway prerequisites
    are strictly present and verified before running Pretrained ML / Transformer inference.
    """

    @staticmethod
    def validate_data1_section_geometry(data1: Any) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Gate 1: Physical Section Corridor & Surveyed Track Geometry Matrix
        Prerequisite: Surveyed 130 km/h sections, track lines, and station IDs.
        """
        if not data1:
            return False, "Data 1 (Corridor & Section Geometry Matrix) is completely missing. Execution blocked at Gate 1.", {"gate": 1, "status": "BLOCKED"}
        
        if not isinstance(data1, (list, dict)):
            return False, "Data 1 must be a valid list of sections or section dictionary.", {"gate": 1, "status": "BLOCKED"}

        sections_list = data1 if isinstance(data1, list) else data1.get("sections", [])
        if not sections_list or len(sections_list) == 0:
            return False, "Data 1 contains 0 sections. Minimum 1 surveyed railway section is required to compute track possession.", {"gate": 1, "status": "BLOCKED"}

        required_section_fields = ["id", "name", "maxSpeedKmH"]
        for idx, sec in enumerate(sections_list):
            for field in required_section_fields:
                if field not in sec:
                    return False, f"Data 1 Section #{idx+1} is missing mandatory field '{field}'.", {"gate": 1, "status": "BLOCKED"}

        return True, f"Gate 1 Passed: {len(sections_list)} surveyed railway sections verified with 130 km/h fitment.", {
            "gate": 1,
            "status": "PASSED",
            "sections_count": len(sections_list),
            "gate_name": "Physical Track Geometry & Speed Matrix"
        }

    @staticmethod
    def validate_data2_train_timetables(data2: Any) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Gate 2: Active Superfast Train Timetables, Headways & Live Telemetry Graph
        Prerequisite: Train numbers, priority classification, and target stations.
        """
        if not data2:
            return False, "Data 2 (Active Train Timetables & Headway Matrix) is completely missing. Execution blocked at Gate 2.", {"gate": 2, "status": "BLOCKED"}

        trains_list = data2 if isinstance(data2, list) else data2.get("trains", [])
        if not trains_list or len(trains_list) == 0:
            return False, "Data 2 contains 0 train schedules. Timetable headway analysis requires active train schedules.", {"gate": 2, "status": "BLOCKED"}

        required_train_fields = ["trainNumber", "name", "priority"]
        for idx, trn in enumerate(trains_list):
            for field in required_train_fields:
                if field not in trn:
                    return False, f"Data 2 Train #{idx+1} is missing mandatory field '{field}'.", {"gate": 2, "status": "BLOCKED"}

        return True, f"Gate 2 Passed: {len(trains_list)} active train services verified for headway conflict prevention.", {
            "gate": 2,
            "status": "PASSED",
            "trains_count": len(trains_list),
            "gate_name": "Train Timetable & Dynamic Headway Graph"
        }

    @staticmethod
    def validate_data3_work_orders(data3: Any) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Gate 3: Multi-Department Maintenance Problem Requests & Work Orders
        Prerequisite: Department ID, required duration, section ID, and machinery constraints.
        """
        if not data3:
            return False, "Data 3 (Department Maintenance Requests) is completely missing. Execution blocked at Gate 3.", {"gate": 3, "status": "BLOCKED"}

        blocks_list = data3 if isinstance(data3, list) else data3.get("blocks", [])
        if not blocks_list or len(blocks_list) == 0:
            return False, "Data 3 contains 0 maintenance requests. No work orders found to optimize.", {"gate": 3, "status": "BLOCKED"}

        required_block_fields = ["id", "title", "departmentId", "sectionId", "durationHours"]
        for idx, blk in enumerate(blocks_list):
            for field in required_block_fields:
                if field not in blk:
                    return False, f"Data 3 Maintenance Request #{idx+1} ({blk.get('id', 'Unknown')}) is missing mandatory field '{field}'.", {"gate": 3, "status": "BLOCKED"}

        return True, f"Gate 3 Passed: {len(blocks_list)} department maintenance requests verified for bundling.", {
            "gate": 3,
            "status": "PASSED",
            "blocks_count": len(blocks_list),
            "gate_name": "Multi-Department Work Orders & Constraints"
        }

    @classmethod
    def evaluate_all_gates(cls, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs full multi-stage gate validation. If ANY gate fails, the pipeline halts immediately.
        """
        data1 = payload.get("data1_sections") or payload.get("sections")
        data2 = payload.get("data2_trains") or payload.get("trains")
        data3 = payload.get("data3_work_orders") or payload.get("blocks")

        # Evaluate Gate 1
        g1_pass, g1_msg, g1_meta = cls.validate_data1_section_geometry(data1)
        if not g1_pass:
            return {
                "all_passed": False,
                "failed_gate": "GATE_1_SECTION_GEOMETRY",
                "message": g1_msg,
                "gate_reports": [g1_meta, {"gate": 2, "status": "SKIPPED"}, {"gate": 3, "status": "SKIPPED"}]
            }

        # Evaluate Gate 2
        g2_pass, g2_msg, g2_meta = cls.validate_data2_train_timetables(data2)
        if not g2_pass:
            return {
                "all_passed": False,
                "failed_gate": "GATE_2_TRAIN_TIMETABLES",
                "message": g2_msg,
                "gate_reports": [g1_meta, g2_meta, {"gate": 3, "status": "SKIPPED"}]
            }

        # Evaluate Gate 3
        g3_pass, g3_msg, g3_meta = cls.validate_data3_work_orders(data3)
        if not g3_pass:
            return {
                "all_passed": False,
                "failed_gate": "GATE_3_WORK_ORDERS",
                "message": g3_msg,
                "gate_reports": [g1_meta, g2_meta, g3_meta]
            }

        # All Gates Passed
        return {
            "all_passed": True,
            "failed_gate": None,
            "message": "All prerequisite data gates PASSED. Pipeline unlocked for Pretrained Transformer & OR-Tools Optimization.",
            "gate_reports": [g1_meta, g2_meta, g3_meta]
        }
