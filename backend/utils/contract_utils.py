

def calculate_commission_rate(client_source: str,total_received: float = None):
    if total_received is None or client_source == "线上":
        return 4
    else:
        if total_received < 50000:
            return 10
        elif total_received < 100000:
            return 12
        else:
            return 15