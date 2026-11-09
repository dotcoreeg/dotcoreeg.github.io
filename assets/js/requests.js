/* DOT CORE — request catalogue shared by the contact box (index) and the full request forms (request.html) */
(function () {
  'use strict';
  var S = function (k, l, o, x) { x = x || {}; return { k: k, l: l, t: 'select', o: o, r: x.r, h: x.h }; },
      T = function (k, l, x) { x = x || {}; return { k: k, l: l, t: 'text', r: x.r, h: x.h, ph: x.ph }; },
      U = function (k, l, x) { x = x || {}; return { k: k, l: l, t: 'url', r: x.r, h: x.h }; },
      C = function (k, l, o, x) { x = x || {}; return { k: k, l: l, t: 'checks', o: o, r: x.r, h: x.h }; },
      D = function (k, l, x) { x = x || {}; return { k: k, l: l, t: 'date', r: x.r, h: x.h }; },
      A = function (k, l, x) { x = x || {}; return { k: k, l: l, t: 'area', r: x.r, h: x.h, ph: x.ph }; };
  var ENV = S('env', 'Operating environment', ['Indoor / benign', 'Industrial', 'Outdoor', 'Vehicle', 'High temperature / harsh', 'Not sure']);
  var STAGE = S('stage', 'Project stage', ['Idea', 'Requirements defined', 'Design exists', 'Prototype exists', 'In production']);
  var WHEN = S('when', 'Target timeline', ['Flexible', 'Within 1 month', '1–3 months', 'More than 3 months']);
  var AREAS = ['PCB design', 'Embedded systems', 'Robotics', 'Automation', 'Mechanical design', 'Power electronics', 'IoT', 'AI', 'Model-based design', 'Testing', 'Business / operations', 'Other'];

  var CATS = [
    { id: 'pcb', g: 0, n: 'PCB design & hardware', hint: 'Schematic, layout, DFM/DFT and BOM work.', kw: /\b(pcb|schematic|gerber|layout|altium|kicad|bom|hardware design|circuit board)\b/i, q: ['layers', 'when'],
      s: [['Project overview', [A('purpose', 'What does the board do?', { r: 1, h: 'Function, users and the problem it solves.' }), C('services', 'Services needed', ['Schematic design', 'PCB layout', 'DFM / DFT review', 'BOM optimisation', 'Prototype coordination', 'Full design package']), S('industry', 'Application area', ['Consumer', 'Industrial', 'Education / research', 'Energy', 'Telecom', 'Automotive', 'Other']), STAGE]],
          ['Technical requirements', [S('layers', 'Layers', ['1–2', '4', '6', '8 or more', 'Not sure']), S('type', 'Circuit type', ['Digital', 'Analog', 'Mixed-signal', 'High-speed', 'RF', 'Power']), T('size', 'Approx. board size (mm)'), T('supply', 'Supply voltage / current'), T('mcu', 'Main ICs: MCU / FPGA / key parts (if chosen)'), C('ifaces', 'Interfaces', ['USB', 'Ethernet', 'CAN', 'RS-485', 'UART / SPI / I²C', 'Wi-Fi / BLE', 'RF / antenna', 'High-speed memory', 'Other']), ENV, S('parts', 'Component preference', ['Easy to source in Egypt', 'Best technical choice', 'Cost-optimised', 'Mixed']), T('standards', 'Standards / certifications targeted (CE, FCC…)'), T('mech', 'Mechanical constraints (enclosure, connectors, mounting)')]],
          ['Deliverables & quantity', [C('deliv', 'Deliverables required', ['Schematic (PDF + native)', 'PCB layout (native)', 'Fabrication package (Gerber)', 'BOM with alternates', 'Assembly drawings', 'Design review report', 'Test plan', 'Prototype build support']), S('tool', 'Preferred EDA tool', ['Altium', 'KiCad', 'OrCAD / Allegro', 'Eagle / Fusion', 'No preference']), S('qty', 'Quantity', ['Single prototype', 'Small batch', 'Pilot run', 'Production'])]]] },
    { id: 'embedded', g: 0, n: 'Embedded systems & firmware', hint: 'Firmware, drivers, RTOS and hardware bring-up.', kw: /\b(firmware|stm32|esp32|mcu|embedded|rtos|arduino|microcontroller|bootloader|risc-?v)\b/i, q: ['mcu', 'when'],
      s: [['Project overview', [A('purpose', 'What does the device do?', { r: 1 }), C('services', 'Services needed', ['Firmware development', 'Drivers & peripherals', 'RTOS', 'Bootloader / OTA update', 'Code review', 'Hardware bring-up']), S('hw', 'Hardware status', ['Hardware exists', 'Hardware in design', 'Need hardware too']), STAGE]],
          ['Technical requirements', [T('mcu', 'MCU / platform (if known)'), S('lang', 'Language', ['C', 'C++', 'Rust', 'MicroPython', 'Not decided']), S('os', 'Runtime', ['Bare-metal', 'FreeRTOS', 'Zephyr', 'Embedded Linux', 'Not decided']), C('ifaces', 'Interfaces', ['UART', 'SPI', 'I²C', 'CAN', 'USB', 'Ethernet', 'BLE', 'Wi-Fi', 'LoRa', 'ADC / DAC', 'PWM / motor control', 'Display', 'Other']), T('limits', 'Memory / power / timing constraints'), S('update', 'Firmware update', ['Not needed', 'Over the air', 'USB / wired', 'Not sure']), S('security', 'Security', ['Not needed', 'Secure boot / encryption', 'Not sure']), T('tools', 'Toolchain / IDE preference')]],
          ['Deliverables', [C('deliv', 'Deliverables required', ['Source code', 'Architecture document', 'Test firmware', 'Bootloader', 'Unit tests', 'Handover documentation'])]]] },
    { id: 'robotics', g: 0, n: 'Robotics & motion control', hint: 'Manipulators, mobile robots, motion control and research platforms.', kw: /\b(robot|robotics|manipulator|kinematic|servo|ros2?|gripper|mobile robot)\b/i, q: ['type', 'stage'],
      s: [['Project overview', [A('purpose', 'What should the system do?', { r: 1 }), S('type', 'System type', ['Manipulator / arm', 'Mobile robot', 'Gripper / end-effector', 'Motion control', 'Research platform', 'Other']), C('services', 'Services needed', ['Concept & feasibility', 'Mechanical design', 'Electronics', 'Control software', 'Simulation', 'Prototype build']), STAGE]],
          ['Technical requirements', [T('dof', 'Degrees of freedom / axes'), T('payload', 'Payload'), T('reach', 'Reach / workspace'), T('perf', 'Speed / accuracy / repeatability'), S('act', 'Actuators', ['Servo', 'Stepper', 'BLDC', 'Pneumatic', 'Not decided']), C('sense', 'Sensing', ['Encoders', 'Vision / camera', 'Force / torque', 'IMU', 'LiDAR / distance', 'Limit switches', 'Other']), S('ctl', 'Controller', ['Microcontroller', 'Industrial PC', 'ROS / ROS 2', 'PLC', 'Not decided']), S('safe', 'Human interaction', ['Isolated / caged', 'Works near people', 'Not sure']), ENV]],
          ['Deliverables', [C('deliv', 'Deliverables required', ['Concept study', 'CAD model', 'Electronics design', 'Control software', 'Simulation model', 'Working prototype', 'Documentation'])]]] },
    { id: 'automation', g: 0, n: 'Automation & industrial control', hint: 'Machine control, production lines, panels and monitoring.', kw: /\b(plc|scada|hmi|automation|conveyor|industrial control|control panel|retrofit)\b/i, q: ['area', 'controller'],
      s: [['Project overview', [A('purpose', 'What should be automated?', { r: 1 }), S('area', 'Application', ['Machine control', 'Production line', 'Process monitoring', 'Control panel design', 'Retrofit / upgrade', 'Other']), STAGE]],
          ['Technical requirements', [S('controller', 'Controller', ['PLC', 'Microcontroller / custom', 'SCADA / HMI', 'Not decided']), T('io', 'Approx. number of inputs / outputs'), C('iotypes', 'Signal types', ['Digital inputs', 'Digital outputs', 'Analog inputs', 'Analog outputs', 'Motor drives / VFD', 'Servo / stepper axes', 'Fieldbus / Modbus', 'Ethernet / OPC UA']), S('hmi', 'Operator interface', ['None', 'Local HMI', 'SCADA', 'Web dashboard']), S('volt', 'Supply', ['24 V DC', '220 V AC', '380 V three-phase', 'Mixed', 'Not sure']), T('existing', 'Existing equipment / brands'), T('standards', 'Safety standards to follow'), ENV]],
          ['Deliverables', [C('deliv', 'Deliverables required', ['Control program', 'Electrical schematics', 'Panel layout', 'HMI screens', 'I/O list', 'Commissioning support', 'Documentation'])]]] },
    { id: 'mechanical', g: 0, n: 'Mechanical design & 3D modelling', hint: 'CAD, enclosures, drawings and design for manufacturing.', kw: /\b(cad|solidworks|3d model|enclosure|mechanical|cnc|3d print|housing|bracket|fusion 360)\b/i, q: ['process', 'stage'],
      s: [['Project overview', [A('purpose', 'What is the part or product for?', { r: 1 }), C('services', 'Services needed', ['3D modelling (CAD)', 'Enclosure design', '2D manufacturing drawings', 'Design for manufacturing', 'Simulation (FEA)', 'Prototype / 3D printing']), STAGE]],
          ['Technical requirements', [S('process', 'Intended process', ['3D printing', 'CNC machining', 'Sheet metal', 'Injection moulding', 'Not decided']), S('material', 'Material', ['Plastic', 'Aluminium', 'Steel', 'Mixed', 'Not decided']), T('size', 'Overall size / envelope (mm)'), T('loads', 'Loads / environment / protection rating'), T('tol', 'Critical tolerances'), S('asm', 'Assembly', ['Single part', 'Few parts', 'Multi-part assembly', 'Mechanism with moving parts']), T('fit', 'Must fit with (PCB, motor, other parts)'), S('cad', 'CAD tool preference', ['SolidWorks', 'Fusion 360', 'FreeCAD', 'Inventor', 'No preference'])]],
          ['Deliverables', [C('deliv', 'Deliverables required', ['3D model (STEP + native)', '2D drawings', 'Parts list', 'Assembly instructions', 'Simulation report', 'Prototype / test print'])]]] },
    { id: 'power', g: 0, n: 'Power electronics', hint: 'Supplies, converters, motor drivers and battery systems.', kw: /\b(power supply|smps|inverter|converter|battery|bms|motor driver|charger|buck|boost)\b/i, q: ['type', 'level'],
      s: [['Project overview', [A('purpose', 'What must the power system do?', { r: 1 }), S('type', 'System type', ['AC-DC supply', 'DC-DC converter', 'Motor driver', 'Battery / BMS', 'Charger', 'Inverter', 'Other']), STAGE]],
          ['Technical requirements', [T('vin', 'Input voltage range'), T('vout', 'Output voltage(s)'), S('level', 'Power level', ['Below 100 W', '100 W – 1 kW', 'Above 1 kW', 'Not sure']), T('iout', 'Output current / peak load'), S('topo', 'Topology', ['Buck', 'Boost', 'Flyback', 'Forward / LLC', 'Full / half bridge', 'Not decided']), S('iso', 'Isolation', ['Isolated', 'Non-isolated', 'Not sure']), C('prot', 'Protections', ['Over-current', 'Over-voltage', 'Over-temperature', 'Short-circuit', 'Reverse polarity', 'Soft start', 'Other']), T('eff', 'Efficiency / size targets'), S('cool', 'Cooling', ['Natural', 'Fan', 'Heatsink', 'Not sure']), T('batt', 'Battery chemistry / cells (if relevant)')]],
          ['Deliverables', [C('deliv', 'Deliverables required', ['Schematic', 'PCB layout', 'Magnetics design', 'Simulation', 'Prototype & test report', 'BOM'])]]] },
    { id: 'iot', g: 0, n: 'IoT & connected devices', hint: 'Devices, connectivity, gateways and dashboards.', kw: /\b(iot|mqtt|lora|gateway|connected device|telemetry|wireless sensor)\b/i, q: ['conn', 'stage'],
      s: [['Project overview', [A('purpose', 'What should the system monitor or control?', { r: 1 }), STAGE]],
          ['Technical requirements', [S('conn', 'Connectivity', ['Wi-Fi', 'Bluetooth', 'LoRa', 'Cellular', 'Ethernet', 'Not decided']), T('devices', 'Number of devices (approx.)'), T('sensors', 'Sensors / measurements'), S('power', 'Power source', ['Mains', 'Battery (long life)', 'Solar', 'Not sure']), T('rate', 'Reporting interval / data rate'), T('range', 'Range / environment'), S('cloud', 'Cloud / backend', ['Yes', 'No', 'Not sure']), S('platform', 'Platform', ['AWS IoT', 'Azure IoT', 'Google Cloud', 'Self-hosted / MQTT', 'Not decided']), S('dash', 'Dashboard / app', ['Web', 'Mobile', 'Both', 'None']), S('security', 'Security needs', ['Standard', 'Elevated', 'Not sure'])]],
          ['Deliverables', [C('deliv', 'Deliverables required', ['Device hardware', 'Firmware', 'Gateway', 'Cloud backend', 'Dashboard / app', 'Field test'])]]] },
    { id: 'ai', g: 0, n: 'AI & intelligent systems', hint: 'Vision, analytics and edge intelligence for engineered systems.', kw: /\b(machine learning|ai|computer vision|neural|object detection|edge ai|predictive)\b/i, q: ['need', 'data'],
      s: [['Project overview', [A('purpose', 'What decision or task should the system automate?', { r: 1 }), S('need', 'Use case', ['Computer vision', 'Predictive maintenance', 'Signal / sensor analytics', 'Edge AI deployment', 'Other']), STAGE]],
          ['Technical requirements', [S('data', 'Data', ['Available', 'Needs collection', 'Not sure']), T('volume', 'Data volume / format'), S('labels', 'Labelled data', ['Yes', 'Partly', 'No']), S('deploy', 'Deployment', ['Edge device', 'Cloud', 'Not decided']), T('hw', 'Target hardware (Jetson, Raspberry Pi, MCU…)'), T('targets', 'Accuracy / latency targets'), S('sens', 'Data sensitivity', ['Public', 'Internal', 'Confidential']), T('fw', 'Preferred frameworks')]],
          ['Deliverables', [C('deliv', 'Deliverables required', ['Feasibility study', 'Dataset preparation', 'Trained model', 'Edge deployment', 'Evaluation report', 'Integration'])]]] },
    { id: 'mbd', g: 0, n: 'Model-based design & simulation', hint: 'System modelling, controller design, simulation and verification.', kw: /\b(simulink|model-?based|mbd|simulation|hil|sil|code generation|plant model)\b/i, q: ['tool', 'stage'],
      s: [['Project overview', [A('purpose', 'What system is to be modelled or controlled?', { r: 1 }), C('services', 'Services needed', ['System modelling', 'Controller design', 'Simulation & verification', 'Automatic code generation', 'SIL / HIL testing']), STAGE]],
          ['Technical requirements', [S('tool', 'Tooling', ['MATLAB / Simulink', 'Open-source (Modelica, Python)', 'No preference']), S('plant', 'Plant model', ['Available', 'Needs to be built', 'Not sure']), T('dyn', 'System type / dynamics (motor, thermal, vehicle…)'), T('rate', 'Control rate / sampling'), T('target', 'Target hardware for code generation'), S('coding', 'Coding standard', ['None', 'MISRA C', 'Not sure']), C('verif', 'Verification needed', ['SIL', 'PIL', 'HIL', 'Requirements traceability', 'Test coverage']), S('meas', 'Measured data', ['Available', 'Can be collected', 'None'])]],
          ['Deliverables', [C('deliv', 'Deliverables required', ['Simulation models', 'Controller design', 'Generated code', 'Test cases', 'Verification report', 'Documentation'])]]] },
    { id: 'prototype', g: 0, n: 'Prototyping & small batches', hint: 'Prototype builds and small-batch coordination.', kw: /\b(prototype|prototyping|assembly|small batch|pilot run)\b/i, q: ['qty', 'when'],
      s: [['Project overview', [A('purpose', 'What is being built?', { r: 1 }), C('services', 'Services needed', ['PCB fabrication', 'Assembly', 'Enclosure', 'Functional test', 'Small batch'])]],
          ['Technical requirements', [S('qty', 'Quantity', ['Single prototype', 'Small batch', 'Pilot run', 'Production']), T('board', 'Board / product details (size, layers)'), S('asm', 'Assembly type', ['Through-hole', 'SMD', 'Mixed', 'Not sure']), S('files', 'Existing material', ['Nothing yet', 'Schematic / drawings', 'Fabrication files', 'Full package']), S('test', 'Testing', ['None', 'Functional test', 'Burn-in / reliability']), S('source', 'Components sourced by', ['Client', 'DOT CORE', 'Mixed']), S('delivery', 'Delivery', ['Pick-up in Cairo', 'Courier within Egypt', 'International shipping'])]]] },
    { id: 'test', g: 0, n: 'Testing & validation', hint: 'Functional, reliability and pre-compliance testing, test fixtures.', kw: /\b(test plan|validation|testing|verification|reliability|emc|test fixture)\b/i, q: ['stage', 'when'],
      s: [['Project overview', [A('purpose', 'What needs to be verified?', { r: 1 }), C('services', 'Services needed', ['Functional testing', 'Reliability testing', 'EMC pre-compliance', 'Test fixture design', 'Test automation']), STAGE]],
          ['Technical requirements', [T('product', 'Product under test'), T('standards', 'Standards / specifications concerned'), S('samples', 'Number of samples', ['1', '2–5', '6–20', 'More than 20']), S('where', 'Where', ['At your site', 'At DOT CORE', 'Either']), T('accept', 'Acceptance criteria')]]] },
    { id: 'review', g: 0, n: 'Design review & consulting', hint: 'Independent review of schematics, layouts, firmware or architecture.', kw: /\b(design review|review my|consult|second opinion|audit)\b/i, q: ['type', 'when'],
      s: [['Project overview', [A('purpose', 'What is the design and what worries you?', { r: 1 }), S('type', 'What should be reviewed', ['Schematic', 'PCB layout', 'Firmware', 'System architecture', 'General consulting']), STAGE]],
          ['Review scope', [C('focus', 'Review focus', ['Correctness', 'Manufacturability', 'EMC / signal integrity', 'Cost', 'Reliability', 'Safety']), S('format', 'Report format', ['Written report', 'Call / workshop', 'Both']), S('files', 'Material available', ['Schematic', 'Schematic + layout', 'Source code', 'Documentation only'])]]] },
    { id: 'repair', g: 0, n: 'Debugging & repair', hint: 'Fault finding and repair review for boards and devices.', kw: /\b(debug|repair|not working|doesn'?t work|fault|burnt|short circuit|troubleshoot)\b/i, q: ['device', 'fault'],
      s: [['Fault description', [T('device', 'Device / board', { r: 1 }), A('purpose', 'What happens and when?', { r: 1 }), S('fault', 'Symptom', ['No power', 'Intermittent', 'Overheating', 'Communication fault', 'Wrong output', 'Other']), A('history', 'What changed before the fault / what was tried?'), T('volt', 'Operating voltage')]],
          ['Logistics', [S('docs', 'Schematics available', ['Yes', 'Partly', 'No']), S('loc', 'Location', ['Can ship / bring it', 'On-site visit needed']), S('urg', 'Urgency', ['Normal', 'Urgent'])]]] },
    { id: 'education', g: 1, n: 'Training & workshops', hint: 'Technical workshops and engineering training.', kw: /\b(training|workshop|course|teach|bootcamp|lecture)\b/i, q: ['audience', 'format'],
      s: [['Training request', [A('purpose', 'Goals of the training', { r: 1 }), S('audience', 'Audience', ['University / students', 'Company team', 'Individual']), T('topics', 'Topics of interest'), S('level', 'Level', ['Beginner', 'Intermediate', 'Advanced']), S('size', 'Group size', ['1–10', '11–30', 'More than 30']), S('format', 'Format', ['On-site', 'Online', 'Either']), S('dur', 'Duration', ['Half day', '1 day', '2–5 days', 'Multi-week programme']), S('lab', 'Hands-on equipment', ['Provided by organiser', 'Needed from DOT CORE', 'Not sure']), T('place', 'Location'), WHEN]]] },
    { id: 'student', g: 1, n: 'Student project & scholarship', hint: 'Engineering support and the planned scholarship programme.', kw: /\b(student|scholarship|graduation project|thesis|university project|capstone)\b/i, q: ['level', 'area'],
      s: [['Applicant', [S('level', 'Applicant', ['Undergraduate', 'Graduate', 'Researcher', 'Startup team']), T('inst', 'University / institution'), T('year', 'Year / stage of study'), S('size', 'Team size', ['Just me', '2–3', '4–6', 'More than 6'])]],
          ['Project', [T('title', 'Project title / idea', { r: 1 }), S('area', 'Project area', AREAS), S('need', 'What you need', ['Engineering support', 'Scholarship consideration', 'Mentoring']), A('purpose', 'Describe the project and where you are stuck', { r: 1 }), T('sup', 'Supervisor (optional)'), D('deadline', 'Deadline (if any)')]]] },
    { id: 'research', g: 1, n: 'Research collaboration', hint: 'Joint projects, research prototypes and testing.', kw: /\b(research|paper|co-?author|lab|joint project|academic)\b/i, q: ['org', 'type'],
      s: [['Collaboration', [T('org', 'Institution / lab', { r: 1 }), S('type', 'Collaboration type', ['Joint project', 'Prototype for research', 'Testing / data', 'Publication']), S('area', 'Field', AREAS), A('purpose', 'Research question and what you need from DOT CORE', { r: 1 }), S('fund', 'Funding', ['Funded', 'Seeking funding', 'Unfunded']), S('ip', 'IP / publication terms', ['Open publication', 'Shared IP', 'To be discussed']), WHEN]]] },
    { id: 'careers', g: 2, n: 'Careers & hiring', hint: 'Join DOT CORE. Share a link to your CV; attachments are not collected here.', kw: /\b(job|hiring|career|careers|cv|resume|intern|internship|vacancy|position|apply)\b/i, q: ['area', 'link'],
      s: [['Role', [S('area', 'Area of interest', AREAS, { r: 1 }), S('level', 'Level', ['Intern', 'Junior', 'Mid-level', 'Senior', 'Lead']), S('mode', 'Work mode', ['On-site (Cairo)', 'Hybrid', 'Remote']), S('avail', 'Availability', ['Immediately', 'Within 1 month', '2–3 months', 'Flexible'])]],
          ['Background', [S('exp', 'Experience', ['0–1 years', '2–4 years', '5–9 years', '10+ years']), T('skills', 'Key skills and tools'), U('link', 'Portfolio / LinkedIn / GitHub', { r: 1 }), U('cv', 'Link to your CV'), A('proud', 'A project you are proud of, and your part in it'), A('purpose', 'Short message', { r: 1 })]]] },
    { id: 'partnership', g: 2, n: 'Partnerships & agreements', hint: 'Technology, manufacturing, university and commercial partnerships.', kw: /\b(partner|partnership|collaborat|agreement|mou|sponsor|distribut|invest)\w*/i, q: ['org', 'type'],
      s: [['Organisation', [T('org', 'Organisation', { r: 1 }), S('type', 'Partnership type', ['Technology partner', 'Manufacturing partner', 'University', 'Distributor', 'Investor', 'Other']), T('region', 'Country / region'), U('web', 'Website'), S('prior', 'Existing relationship', ['None', 'Contact with a team member', 'Previous project'])]],
          ['Proposal', [A('purpose', 'Proposal in brief', { r: 1 }), A('contrib', 'What each side contributes'), S('when', 'Timeline', ['Exploratory', 'Within 3 months', 'Within 6 months', 'Flexible'])]]] },
    { id: 'supplier', g: 2, n: 'Suppliers & vendors', hint: 'Components, fabrication, assembly, tools and services.', kw: /\b(supplier|vendor|we supply|our products|catalog(ue)?)\b/i, q: ['company', 'offer'],
      s: [['Company', [T('company', 'Company', { r: 1 }), S('offer', 'What you offer', ['Components', 'PCB fabrication', 'Assembly', 'Tools & equipment', 'Software / services', 'Other']), T('place', 'Country / city'), U('web', 'Website'), S('auth', 'Authorised distributor', ['Yes', 'No', 'Not applicable'])]],
          ['Offer', [T('cats', 'Product / service categories'), T('lead', 'Typical lead time'), U('cat', 'Catalogue link'), A('purpose', 'Details', { r: 1 })]]] },
    { id: 'events', g: 2, n: 'Events & speaking', hint: 'Conferences, exhibitions, talks and sponsorship.', kw: /\b(conference|event|speaker|keynote|exhibition|expo|summit|invite|invitation)\b/i, q: ['event', 'date'],
      s: [['Event', [T('event', 'Event name', { r: 1 }), S('role', 'Request', ['Speaker invitation', 'Exhibition', 'Workshop', 'Sponsorship', 'Other']), T('date', 'Date'), T('place', 'Location / online'), U('web', 'Event website'), S('aud', 'Expected audience', ['Under 50', '50–200', '200–1000', 'More than 1000'])]],
          ['Details', [T('topic', 'Topic / session'), S('cost', 'Costs', ['Covered by organiser', 'To be discussed']), D('reply', 'Reply needed by'), A('purpose', 'Details', { r: 1 })]]] },
    { id: 'press', g: 2, n: 'Press & media', hint: 'Interviews, features and statements.', kw: /\b(press|journalist|interview|media|article|magazine)\b/i, q: ['outlet', 'type'],
      s: [['Request', [T('outlet', 'Outlet / publication', { r: 1 }), S('type', 'Request', ['Interview', 'Feature', 'Statement', 'Other']), S('format', 'Format', ['Written', 'Video', 'Podcast', 'Live']), T('reach', 'Audience / reach'), T('topic', 'Topic'), D('deadline', 'Deadline'), A('purpose', 'Request details', { r: 1 })]]] },
    { id: 'complaint', g: 2, n: 'Complaint', hint: 'Report a problem with our work or conduct. Your complaint will be reviewed in confidence.', kw: /\b(complain|complaint|refund|unhappy|dissatisf|not satisfied|unacceptable|escalat)\w*/i, q: ['nature', 'ref'],
      s: [['About the complaint', [S('nature', 'Nature of the complaint', ['Quality of work', 'Delay', 'Communication', 'Billing', 'Conduct', 'Data / IP concern', 'Other'], { r: 1 }), S('role', 'Your relationship with us', ['Client', 'Student', 'Partner', 'Supplier', 'Other']), T('ref', 'Project / reference (if any)'), D('date', 'When it happened'), T('who', 'People involved')]],
          ['What happened', [A('purpose', 'Describe what happened', { r: 1 }), S('prior', 'Raised before', ['No', 'Yes, by email', 'Yes, by phone']), U('evidence', 'Link to evidence (documents, messages)'), S('outcome', 'Outcome you expect', ['Correction of the work', 'Explanation', 'Refund / adjustment', 'Process improvement', 'Not sure'])]]] },
    { id: 'general', g: 2, n: 'General inquiry', hint: 'Anything else.', kw: null, q: [], s: [['Message', [T('subject', 'Subject'), A('purpose', 'Your message', { r: 1 })]]] }
  ];
  var GROUPS = ['Engineering services', 'Programs', 'Company'], CBY = {};
  CATS.forEach(function (c) { CBY[c.id] = c; });

  var COMMON = {
    contact: ['Your details', [T('name', 'Name', { r: 1 }), { k: 'email', l: 'Email', t: 'email', r: 1 }, { k: 'phone', l: 'Phone / WhatsApp', t: 'tel' }, T('org', 'Company / university'), T('role', 'Your role'), T('place', 'Country / city'), S('pref', 'Preferred contact', ['Email', 'WhatsApp', 'Phone call']), S('best', 'Best time to reach you (Cairo time)', ['Any time', 'Morning', 'Afternoon', 'Evening'])]],
    commercial: ['Timeline & commercial', [WHEN, D('deadline', 'Hard deadline (if any)'), S('engage', 'Preferred engagement', ['Fixed-price project', 'Time and materials', 'Support contract', 'Design review only', 'Not sure']), S('budget', 'Budget status', ['Not decided yet', 'Approved', 'Seeking funding', 'Student / non-profit']), T('range', 'Budget range, optional (EGP or USD)'), S('ip', 'IP expectation', ['Client owns deliverables', 'Shared / to be discussed', 'Not sure']), S('decider', 'Your role in the decision', ['Decision maker', 'Evaluating for my organisation', 'Student / individual']), { k: 'nda', l: 'We need an NDA before sharing technical details', t: 'flag' }]],
    commercialLite: ['Timeline', [D('deadline', 'Date needed (if any)'), S('budget', 'Funding', ['Not decided yet', 'Approved', 'Seeking funding', 'Student / non-profit'])]],
    files: ['Files & references', [C('refs', 'Material you already have', ['Specification / requirements', 'Block diagram', 'Schematic', 'PCB layout / Gerbers', 'BOM', 'Source code', 'CAD / STEP files', 'Datasheets', 'Test reports', 'Photos of the device', 'Nothing yet']), U('link', 'Link to files (Drive, GitHub, OneDrive…)', { h: 'Attachments are not collected here. Share a link and grant access.' }), U('link2', 'Additional link'), S('access', 'Link access', ['Public', 'Restricted: I will grant access', 'NDA first']), A('notes', 'Anything else we should know')]]
  };
  function sections(cat) {
    var out = [COMMON.contact].concat(cat.s);
    if (cat.g === 0) out.push(COMMON.commercial, COMMON.files);
    else if (cat.g === 1) out.push(COMMON.commercialLite);
    return out;
  }
  function allFields(cat) { var o = []; cat.s.forEach(function (sec) { sec[1].forEach(function (f) { o.push(f); }); }); return o; }
  function field(cat, k) { return allFields(cat).filter(function (f) { return f.k === k; })[0]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
  function fieldHTML(f, pre) {
    var id = pre + f.k, r = f.r ? ' required' : '', lab = '<label for="' + id + '">' + esc(f.l) + (f.r ? ' *' : '') + '</label>', h = f.h ? '<small class="help">' + esc(f.h) + '</small>' : '';
    if (f.t === 'select') return '<div class="field"' + ' data-k="' + f.k + '">' + lab + '<select id="' + id + '" name="' + f.k + '"' + r + '><option value="">Select…</option>' + f.o.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('') + '</select>' + h + (f.o.indexOf('Other') > -1 ? '<input class="other" name="' + f.k + '__other" placeholder="Please specify" hidden aria-label="' + esc(f.l) + ' — specify">' : '') + '</div>';
    if (f.t === 'checks') return '<fieldset class="field full checks" data-k="' + f.k + '"><legend>' + esc(f.l) + (f.r ? ' *' : '') + '</legend><div class="opts">' + f.o.map(function (o) { return '<label><input type="checkbox" name="' + f.k + '" value="' + esc(o) + '"><span>' + esc(o) + '</span></label>'; }).join('') + '</div>' + (f.o.indexOf('Other') > -1 ? '<input class="other" name="' + f.k + '__other" placeholder="Please specify" hidden aria-label="' + esc(f.l) + ' — specify">' : '') + h + '</fieldset>';
    if (f.t === 'area') return '<div class="field full" data-k="' + f.k + '">' + lab + '<textarea id="' + id + '" name="' + f.k + '"' + r + (f.ph ? ' placeholder="' + esc(f.ph) + '"' : '') + '></textarea>' + h + '</div>';
    if (f.t === 'flag') return '<div class="field full flag" data-k="' + f.k + '"><label class="consent"><input type="checkbox" name="' + f.k + '" value="Yes"><span>' + esc(f.l) + '</span></label></div>';
    return '<div class="field" data-k="' + f.k + '">' + lab + '<input id="' + id + '" name="' + f.k + '" type="' + f.t + '"' + r + (f.t === 'url' ? ' inputmode="url" placeholder="https://"' : '') + (f.ph ? ' placeholder="' + esc(f.ph) + '"' : '') + '>' + h + '</div>';
  }
  /* rows of [label, value] from a container; 'Other' replaced by the specified text */
  function collect(root, fields, only) {
    var rows = [];
    fields.forEach(function (f) {
      if (only && only.indexOf(f.k) < 0) return;
      var other = root.querySelector('[name="' + f.k + '__other"]'), ov = other ? other.value.trim() : '', v;
      if (f.t === 'checks') { var a = [].slice.call(root.querySelectorAll('input[name="' + f.k + '"]:checked')).map(function (x) { return x.value === 'Other' && ov ? 'Other: ' + ov : x.value; }); v = a.join(', '); }
      else if (f.t === 'flag') { var c = root.querySelector('input[name="' + f.k + '"]'); v = c && c.checked ? 'Yes' : ''; }
      else { var el = root.querySelector('[name="' + f.k + '"]'); v = el ? el.value.trim() : ''; if (v === 'Other' && ov) v = 'Other: ' + ov; }
      if (v) rows.push([f.l, v]);
    });
    return rows;
  }
  function bindOther(root) {
    root.addEventListener('change', function (e) {
      var el = e.target, wrap = el.closest('[data-k]'); if (!wrap) return; var o = wrap.querySelector('.other'); if (!o) return;
      var show = el.type === 'checkbox' ? !!wrap.querySelector('input[value="Other"]:checked') : (el.tagName === 'SELECT' && el.value === 'Other');
      if (el.type === 'checkbox' || el.tagName === 'SELECT') o.hidden = !show;
    });
  }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function refId() { var d = new Date(), a = ''; for (var i = 0; i < 4; i++) a += 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'.charAt(Math.floor(Math.random() * 32)); return 'DC-' + String(d.getFullYear()).slice(2) + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + a; }
  function summaryText(cat, ref, groups) {
    var L = ['DOT CORE — REQUEST', 'Reference: ' + ref, 'Type: ' + cat.n, 'Date: ' + new Date().toISOString().slice(0, 10), ''];
    groups.forEach(function (g) { if (!g.rows.length) return; L.push('== ' + g.title.toUpperCase() + ' =='); g.rows.forEach(function (r) { L.push(r[0] + ': ' + r[1]); }); L.push(''); });
    return L.join('\n');
  }
  /* delivery: endpoint first; if it fails (quota, network, blocked) fall back to the visitor's email app so nothing is lost */
  function viaMail(cat, who, ref, subject, text, ui, failed) {
    var cfg = window.DC || {}, body = text, long = text.length > 1700;
    try { if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {}); } catch (e) {}
    if (long) body = 'Reference: ' + ref + '\nType: ' + cat.n + '\n\nThe full request summary was copied to your clipboard. Please paste it here before sending.\n';
    ui.say((failed ? 'Our form service is unavailable right now. ' : '') + (long ? 'Opening your email app. The full summary is copied: paste it into the message.' : 'Opening your email app with your request ready to send.'), !!failed);
    if (ui.fallback) ui.fallback(text, cfg.EMAIL);
    window.location.href = 'mailto:' + cfg.EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    if (ui.done) ui.done(true);
  }
  function post(url, payload, plain) {
    var ctl = window.AbortController ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 15000);
    /* Apps Script needs a "simple" request (text/plain) to avoid a CORS preflight */
    var h = plain ? { 'Content-Type': 'text/plain;charset=utf-8' } : { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    return fetch(url, { method: 'POST', signal: ctl ? ctl.signal : undefined, keepalive: true, headers: h, body: JSON.stringify(payload) })
      .then(function (r) { clearTimeout(to); if (!r.ok) throw 0; return plain ? r.json() : r; })
      .then(function (x) { if (plain && !(x && x.ok)) throw 0; }, function (err) { clearTimeout(to); throw err; });
  }
  /* Every send is logged to the Google Sheet (Started -> result). Order: Formspree -> Apps Script backup -> visitor's email app */
  function deliver(cat, who, ref, text, source, ui) {
    var cfg = window.DC || {}, subject = '[DOT CORE] ' + ref + ' · ' + cat.n + ' · ' + (who.name || who.email);
    if (!cfg.ENDPOINT && !cfg.BACKUP_ENDPOINT) return viaMail(cat, who, ref, subject, text, ui, false);
    var payload = { subject: subject, reference: ref, type: cat.n, source: source, name: who.name, email: who.email, message: text, _replyto: who.email };
    /* also send every answer as its own field so Formspree lists them separately and the dashboard / CSV export stay structured */
    var sec = ''; text.split('\n').forEach(function (ln) { var m = /^== (.+) ==$/.exec(ln); if (m) { sec = m[1]; return; } var k = /^([^:]{1,80}): (.+)$/.exec(ln); if (k && sec) { var key = sec + ' / ' + k[1]; if (!(key in payload)) payload[key] = k[2]; } });
    var log = function (action) { if (!cfg.BACKUP_ENDPOINT) return Promise.resolve(); var p = {}; for (var k in payload) p[k] = payload[k]; p.action = action; return post(cfg.BACKUP_ENDPOINT, p, true).catch(function () {}); };
    var ok = function (how) { return function () { if (how) log(how); ui.busy(false); ui.say('Thank you. Your request ' + ref + ' was sent. Keep this reference for follow-up.'); ui.done(); }; };
    var mail = function () { log('failed'); ui.busy(false); viaMail(cat, who, ref, subject, text, ui, true); };
    ui.busy(true); ui.say('Sending…');
    log('log');                                                               /* 1. recorded as "Started" */
    var backup = function () { if (!cfg.BACKUP_ENDPOINT) return mail(); post(cfg.BACKUP_ENDPOINT, Object.assign({ action: 'deliver' }, payload), true).then(ok(null), mail); };
    if (cfg.ENDPOINT) post(cfg.ENDPOINT, payload, false).then(ok('formspree_ok'), backup); else backup();
  }
  window.DCR = { CATS: CATS, GROUPS: GROUPS, CBY: CBY, sections: sections, allFields: allFields, field: field, esc: esc, fieldHTML: fieldHTML, collect: collect, bindOther: bindOther, EMAIL_RE: EMAIL_RE, refId: refId, summaryText: summaryText, deliver: deliver };
})();
