"""
Grok Image Downloader with Microsoft Edge - Remote Debugging Mode
Connects to your running Edge browser with your logged-in account.
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.edge.options import Options
from selenium.webdriver.common.action_chains import ActionChains
import time
import requests
import os
import random
import subprocess
from pathlib import Path

def random_delay(min_sec=0.5, max_sec=2.0):
    """Add random human-like delay"""
    time.sleep(random.uniform(min_sec, max_sec))

def human_type(element, text):
    """Type text with human-like delays between keystrokes"""
    for char in text:
        element.send_keys(char)
        time.sleep(random.uniform(0.05, 0.15))

def random_mouse_movement(driver):
    """Simulate random mouse movements"""
    try:
        actions = ActionChains(driver)
        body = driver.find_element(By.TAG_NAME, "body")
        for _ in range(random.randint(2, 4)):
            x_offset = random.randint(-100, 100)
            y_offset = random.randint(-100, 100)
            actions.move_to_element_with_offset(body, x_offset, y_offset).perform()
            time.sleep(random.uniform(0.1, 0.3))
    except:
        pass

def start_edge_with_debugging():
    """Start Edge with remote debugging enabled"""
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    
    # Check if path exists, try alternative location
    if not os.path.exists(edge_path):
        edge_path = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    
    if not os.path.exists(edge_path):
        print("❌ Could not find Microsoft Edge installation.")
        print("   Please update the edge_path variable in the script.")
        return False
    
    # Start Edge with remote debugging
    user_data_dir = os.path.join(os.getenv('LOCALAPPDATA'), 'Microsoft', 'Edge', 'User Data')
    
    command = [
        edge_path,
        f"--remote-debugging-port=9222",
        f"--user-data-dir={user_data_dir}",
        "--no-first-run",
        "--no-default-browser-check"
    ]
    
    try:
        subprocess.Popen(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("✅ Edge started with remote debugging on port 9222")
        return True
    except Exception as e:
        print(f"❌ Failed to start Edge: {e}")
        return False

def setup_driver():
    """Connect to existing Edge instance via remote debugging"""
    edge_options = Options()
    edge_options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
    
    # Make browser appear more human
    edge_options.add_argument("--disable-blink-features=AutomationControlled")
    edge_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    edge_options.add_experimental_option('useAutomationExtension', False)
    
    try:
        driver = webdriver.Edge(options=edge_options)
        # Execute script to hide webdriver property
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        return driver
    except Exception as e:
        print(f"\n❌ Error connecting to Edge: {e}")
        print("\n💡 Make sure:")
        print("   1. Edge WebDriver is installed (matching your Edge version)")
        print("   2. Edge is running with debugging enabled")
        raise

def download_image(url, folder, filename):
    """Download an image from URL to specified folder"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        filepath = os.path.join(folder, filename)
        with open(filepath, 'wb') as f:
            f.write(response.content)
        print(f"✓ Downloaded: {filename}")
        return True
    except Exception as e:
        print(f"✗ Failed to download {filename}: {str(e)}")
        return False

def main():
    # Configuration
    URL = "https://grok.com/imagine"
    PROMPT = "cartoonish look for the peptide injection at the anterior distal part of the knee"
    DOWNLOAD_FOLDER = "grok_images"
    MAX_IMAGES = 5
    
    # Create download folder
    Path(DOWNLOAD_FOLDER).mkdir(exist_ok=True)
    print(f"📁 Download folder: {os.path.abspath(DOWNLOAD_FOLDER)}\n")
    
    driver = None
    try:
        print("="*60)
        print("🚀 STEP 1: Starting Edge with Remote Debugging")
        print("="*60)
        
        if not start_edge_with_debugging():
            return
        
        print("\n⏳ Waiting for Edge to fully start...")
        time.sleep(5)
        
        print("\n" + "="*60)
        print("⏸️  STEP 2: MANUAL LOGIN REQUIRED")
        print("="*60)
        print("\n📋 Instructions:")
        print("   1. Edge should now be open")
        print("   2. Go to https://grok.com and LOG IN with:")
        print(f"      📧 jackson29382938@gmail.com")
        print("   3. Navigate to the Imagine page")
        print("   4. Once logged in, return here")
        print("\n⚠️  DO NOT CLOSE THE EDGE WINDOW")
        print("\n" + "="*60)
        
        input("\n✅ Press ENTER when you're logged in and ready...")
        
        print("\n" + "="*60)
        print("🔗 STEP 3: Connecting to Your Edge Browser")
        print("="*60 + "\n")
        
        driver = setup_driver()
        print("✅ Connected to Edge successfully!\n")
        
        # Navigate to Grok Imagine
        print(f"🔗 Navigating to {URL}...")
        driver.get(URL)
        
        # Simulate reading the page
        random_delay(3, 5)
        random_mouse_movement(driver)
        
        print("▶️  Automation started...\n")
        
        # Wait for page to load
        wait = WebDriverWait(driver, 20)
        
        # Find the input field
        print("🔍 Looking for input field...")
        input_selectors = [
            "textarea[placeholder*='imagine' i]",
            "textarea[placeholder*='prompt' i]",
            "textarea[placeholder*='describe' i]",
            "textarea",
            "input[type='text'][placeholder*='imagine' i]",
            "input[type='text']",
            "[contenteditable='true']",
            "[role='textbox']",
            "textarea[name*='prompt']",
            "input[name*='prompt']"
        ]
        
        input_element = None
        for selector in input_selectors:
            try:
                input_element = wait.until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                )
                print(f"✓ Found input field")
                break
            except:
                continue
        
        if not input_element:
            print("❌ Could not find input field.")
            print("\n💡 Possible reasons:")
            print("   - Not on the Imagine page")
            print("   - Not logged in properly")
            print("   - Page structure has changed")
            input("\n📸 Press Enter to continue (browser will stay open)...")
            return
        
        # Scroll to input with human-like behavior
        driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", input_element)
        random_delay(0.8, 1.5)
        
        # Move mouse and click like a human
        actions = ActionChains(driver)
        actions.move_to_element(input_element).perform()
        random_delay(0.5, 0.9)
        input_element.click()
        random_delay(0.7, 1.2)
        
        # Type the prompt with human-like typing
        print(f"⌨️  Typing prompt (human-like)...")
        print(f"   '{PROMPT}'")
        human_type(input_element, PROMPT)
        random_delay(1, 2)
        
        # Submit the prompt
        print("🚀 Submitting prompt...")
        input_element.send_keys(Keys.RETURN)
        random_delay(1, 2)
        
        # Wait for images to generate with periodic updates
        print("\n⏳ Waiting for images to generate...")
        print("   (Grok typically takes 30-60 seconds)")
        for i in range(12):
            time.sleep(5)
            print(f"   {(i+1)*5} seconds elapsed...")
        
        print("\n🖼️  Looking for generated images...")
        random_delay(2, 3)
        
        # Scroll page to ensure all images are loaded
        print("   Scrolling to load all images...")
        driver.execute_script("window.scrollTo({top: document.body.scrollHeight/2, behavior: 'smooth'});")
        random_delay(2, 3)
        driver.execute_script("window.scrollTo({top: 0, behavior: 'smooth'});")
        random_delay(2, 3)
        driver.execute_script("window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'});")
        random_delay(3, 4)
        
        # Find images with multiple strategies
        image_selectors = [
            "img[src*='pbs.twimg.com']",
            "img[src*='x.com']",
            "img[src*='blob:']",
            "img[src*='http']",
            "img[src*='cdn']",
            "img[alt*='generated' i]",
            "img[alt*='image' i]",
            "div[class*='image'] img",
            "picture img",
            "figure img",
            "article img"
        ]
        
        all_images = []
        for selector in image_selectors:
            try:
                images = driver.find_elements(By.CSS_SELECTOR, selector)
                all_images.extend(images)
            except:
                continue
        
        # Filter valid images
        valid_images = []
        seen_urls = set()
        
        print(f"   Found {len(all_images)} total images, filtering...")
        
        for img in all_images:
            try:
                width = img.size['width']
                height = img.size['height']
                if width > 200 and height > 200:
                    src = img.get_attribute('src')
                    if src and src.startswith('http') and src not in seen_urls:
                        valid_images.append(src)
                        seen_urls.add(src)
                        print(f"   ✓ Valid image found: {width}x{height}px")
            except:
                continue
        
        print(f"\n✓ Found {len(valid_images)} valid generated images\n")
        
        if not valid_images:
            print("⚠️  No images found yet.")
            print("\n💡 Let's wait a bit longer and try again...")
            print("   Images might still be generating...")
            
            time.sleep(15)
            print("   Trying again...")
            
            # Try again
            all_images = []
            for selector in image_selectors:
                try:
                    images = driver.find_elements(By.CSS_SELECTOR, selector)
                    all_images.extend(images)
                except:
                    continue
            
            for img in all_images:
                try:
                    width = img.size['width']
                    height = img.size['height']
                    if width > 200 and height > 200:
                        src = img.get_attribute('src')
                        if src and src.startswith('http') and src not in seen_urls:
                            valid_images.append(src)
                            seen_urls.add(src)
                except:
                    continue
            
            if not valid_images:
                print("\n❌ Still no images found.")
                print("   Please check the browser manually.")
                input("\n📸 Press Enter to continue (browser stays open)...")
                return
        
        # Download images
        print("💾 Downloading images...\n")
        download_count = 0
        for i, img_url in enumerate(valid_images[:MAX_IMAGES], 1):
            filename = f"grok_knee_injection_{i}.jpg"
            print(f"   [{i}/{min(len(valid_images), MAX_IMAGES)}] Downloading...")
            if download_image(img_url, DOWNLOAD_FOLDER, filename):
                download_count += 1
            random_delay(0.5, 1.0)
        
        print(f"\n{'='*60}")
        print(f"✅ SUCCESS! Downloaded {download_count} images!")
        print(f"📁 Location: {os.path.abspath(DOWNLOAD_FOLDER)}")
        print(f"{'='*60}\n")
        
        print("✨ Browser will stay open so you can verify the results.")
        input("Press Enter when done (this will close the script, but browser stays open)...")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        input("\nPress Enter to continue...")
    
    finally:
        # Don't quit the driver - leave browser open
        print("\n👋 Script finished. Edge browser will remain open.")

if __name__ == "__main__":
    print("\n" + "="*60)
    print("   🤖 Grok Image Downloader - Microsoft Edge")
    print("   📧 Account: jackson29382938@gmail.com")
    print("   🔧 Mode: Remote Debugging")
    print("="*60 + "\n")
    main()