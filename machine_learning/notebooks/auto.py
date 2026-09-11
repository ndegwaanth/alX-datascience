import pyautogui

# Option A: Click a known screen coordinate
pyautogui.click(x=450, y=300)

# Option B: Find an image of the empty checkbox on screen and click it
box_location = pyautogui.locateOnScreen('empty_checkbox.png')
if box_location:
    pyautogui.click(box_location)
