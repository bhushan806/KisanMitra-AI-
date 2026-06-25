import httpx
import xml.etree.ElementTree as ET

DATA_GOV_API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b"
url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
params = {
    "api-key": DATA_GOV_API_KEY,
    "format": "xml",
    "filters[commodity]": "Onion",
    "limit": 10,
}

try:
    print("Fetching Onion data in XML...")
    resp = httpx.get(url, params=params, timeout=10)
    resp.raise_for_status()
    print("Success! Status code:", resp.status_code)
    root = ET.fromstring(resp.text)
    records = root.find("records")
    if records is not None:
        print(f"Found {len(records.findall('item'))} items.")
        for item in list(records.findall("item"))[:1]:
            for child in item:
                print(f"{child.tag}: {child.text}")
    else:
        print("No records node found.")
except Exception as e:
    print(f"Error: {e}")
