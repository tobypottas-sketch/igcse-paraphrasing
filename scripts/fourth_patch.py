from pathlib import Path

p = Path('index.html')
s = p.read_text()

replacements = {
    'the event worked well because it brought people from different backgrounds together': 'its success came from connecting people from a range of backgrounds',
    'the volunteers were keen to improve the area': 'the helpers were committed to making the place better',
    'the organisers spoke to performers and advertised the event online': 'the planning team got in touch with performers and promoted the occasion on the internet',
    'the programme began last year in order to support younger learners': 'a year earlier, the scheme was launched to assist younger students',
    'volunteers cleaned the site before the event began': 'before the event started, the helpers tidied the site',
    'the museum provides a more personal experience for visitors': 'visitors receive a more individual experience at the museum',
    'students worked as a group to solve the problem': 'the learners solved the issue through teamwork',
    'the leader gave clear instructions before the walk started': 'before the walk began, the guide provided easy-to-understand directions',
    'the project became increasingly successful over time': "the plan's success grew gradually",
    'the writer was pleased with the final result': 'the final outcome left the writer satisfied',
    'the organisers checked the equipment with care before guests arrived': 'before visitors arrived, the planners thoroughly inspected all the equipment',
    'local residents were asked to take part in the festival': 'residents were invited to join the celebration',
    'the plan developed from an unexpected experience': 'a surprising experience gave rise to the idea',
    'the application helps users find hidden locations': 'users can use the application to discover concealed places',
}

for old, new in replacements.items():
    count = s.count(old)
    if count != 1:
        raise SystemExit(f'Expected one occurrence of {old!r}, found {count}')
    s = s.replace(old, new, 1)

p.write_text(s)
