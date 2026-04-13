from PIL import Image  
im = Image.open('assets/Dora.png').convert('RGBA')  
cols = []  
for x in range(im.width):  
    has_px = any(im.getpixel((x, y))[3] > 10 for y in range(im.height))  
    if has_px and (not cols or len(cols[-1]) == 2): cols.append([x])  
    elif not has_px and cols and len(cols[-1]) == 1: cols[-1].append(x)  
print(cols)  
