from lxml import etree

file_path = "build.rbxlx"

tree = etree.parse(file_path)
root = tree.getroot()

for item in root.xpath(".//Item[@class='Lighting']"):
	binary_string_element = item.xpath(".//Properties/BinaryString[@name='AttributesSerialize']")
	
	if binary_string_element:
		binary_string_element[0].text = None

with open(file_path, 'wb') as file:
	file.write(etree.tostring(root, encoding='utf-8', pretty_print=True, xml_declaration=False))