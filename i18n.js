'use strict';
/* Thai / English. Templates are written in English; in Thai mode every text node, placeholder, title and aria-label is translated as it appears. */
let LANG = (() => { try { return localStorage.getItem('northdesk.lang') || 'th'; } catch (e) { return 'th'; } })();
const MON_EN = MON.slice(), WD_EN = WD.slice();
const MON_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const WD_TH = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
function applyLangArrays() { (LANG === 'th' ? MON_TH : MON_EN).forEach((x, i) => MON[i] = x); (LANG === 'th' ? WD_TH : WD_EN).forEach((x, i) => WD[i] = x); document.documentElement.lang = LANG; }
applyLangArrays();

const TH = {
  // navigation & shell
  'Workspace': 'พื้นที่ทำงาน', 'Communication': 'การสื่อสาร', 'Management': 'การจัดการ', 'Settings': 'ตั้งค่า',
  'Dashboard': 'แดชบอร์ด', 'Overview': 'ภาพรวม', 'Online Office': 'ออฟฟิศออนไลน์', 'My Tasks': 'งานของฉัน', 'Projects': 'โปรเจกต์', 'Calendar': 'ปฏิทิน',
  'Chat': 'แชท', 'Voice Rooms': 'ห้องเสียง', 'Meetings': 'ประชุม', 'Submissions': 'การส่งงาน', 'Follow-ups': 'ติดตามงาน', 'Employees': 'พนักงาน',
  'File Center': 'ศูนย์ไฟล์', 'Announcements': 'ประกาศ', 'Reports': 'รายงาน', 'Profile': 'โปรไฟล์', 'Availability & DND': 'สถานะและห้ามรบกวน',
  'Notifications': 'การแจ้งเตือน', 'Workspace Settings': 'ตั้งค่าพื้นที่ทำงาน', 'Permissions': 'สิทธิ์การใช้งาน', 'People & rooms': 'คนและห้อง',
  'All tools & settings': 'เครื่องมือและตั้งค่าทั้งหมด', 'All tools': 'เครื่องมือทั้งหมด', 'Back to office': 'กลับเข้าออฟฟิศ', 'Search': 'ค้นหา', 'Search (/)': 'ค้นหา (/)',
  'Assistant': 'ผู้ช่วย AI', 'Your profile': 'โปรไฟล์ของคุณ', 'Show whole office': 'ดูทั้งออฟฟิศ', 'Follow my character': 'ตามตัวละครของฉัน',
  'Office tools': 'เครื่องมือออฟฟิศ', 'Close': 'ปิด', 'Dismiss': 'ปิด', 'Office': 'ออฟฟิศ', 'Hallway': 'ทางเดิน', 'You': 'คุณ', 'Live': 'สด', 'Guest': 'แขก',
  // statuses
  'Online': 'ออนไลน์', 'Busy': 'ไม่ว่าง', 'Do Not Disturb': 'ห้ามรบกวน', 'Focus': 'โฟกัส', 'In Meeting': 'ประชุมอยู่', 'Away': 'ไม่อยู่', 'Offline': 'ออฟไลน์',
  'To Do': 'ต้องทำ', 'In Progress': 'กำลังทำ', 'Pending Review': 'รอตรวจ', 'Revision Required': 'ต้องแก้ไข', 'Completed': 'เสร็จแล้ว', 'Overdue': 'เลยกำหนด',
  'Urgent': 'ด่วนมาก', 'High': 'สูง', 'Medium': 'กลาง', 'Low': 'ต่ำ', 'Pending': 'รอตรวจ', 'Approved': 'อนุมัติแล้ว', 'Revision': 'ต้องแก้ไข', 'Superseded': 'ถูกแทนที่',
  'Blocked': 'ติดงานอื่น', 'Escalated': 'ส่งต่อหัวหน้าแล้ว', 'Going': 'ไป', 'Maybe': 'อาจจะ', 'Declined': 'ปฏิเสธ', 'RSVP': 'ตอบรับ', 'No reply': 'ยังไม่ตอบ',
  'Open': 'เปิด', 'In progress': 'กำลังดำเนินการ', 'Resolved': 'แก้ไขแล้ว', 'Read': 'อ่านแล้ว', 'Pinned': 'ปักหมุด', 'Working': 'ใช้งานได้', 'Simulated': 'จำลอง', 'Not here': 'ไม่มีในหน้านี้',
  // roles, departments, positions
  'Admin': 'แอดมิน', 'Manager': 'ผู้จัดการ', 'Employee': 'พนักงาน', 'Design': 'ดีไซน์', 'Development': 'พัฒนา', 'Marketing': 'การตลาด', 'Operations & HR': 'ปฏิบัติการและบุคคล',
  'Product Designer': 'นักออกแบบผลิตภัณฑ์', 'UX Researcher': 'นักวิจัย UX', 'Design Lead': 'หัวหน้าทีมดีไซน์', 'Frontend Engineer': 'วิศวกร Frontend', 'Backend Engineer': 'วิศวกร Backend',
  'QA Engineer': 'วิศวกร QA', 'Engineering Manager': 'ผู้จัดการฝ่ายวิศวกรรม', 'Content Strategist': 'นักวางกลยุทธ์คอนเทนต์', 'Growth Marketer': 'นักการตลาดสายเติบโต', 'Marketing Lead': 'หัวหน้าฝ่ายการตลาด',
  'HR Specialist': 'เจ้าหน้าที่บุคคล', 'Office Manager': 'ผู้จัดการสำนักงาน', 'Operations Director': 'ผู้อำนวยการฝ่ายปฏิบัติการ', 'Team member': 'สมาชิกทีม',
  'Product, brand and research': 'ผลิตภัณฑ์ แบรนด์ และงานวิจัย', 'Engineering and QA': 'วิศวกรรมและทดสอบระบบ', 'Campaigns, content and growth': 'แคมเปญ คอนเทนต์ และการเติบโต', 'People, finance and the office': 'บุคคล การเงิน และสำนักงาน',
  // rooms & zones & floor objects
  'General': 'ห้องรวม', 'Meeting Room': 'ห้องประชุม', 'Private': 'ห้องส่วนตัว', 'Focus Room': 'ห้องโฟกัส', 'Private Offices': 'ห้องทำงานส่วนตัว', 'General Lounge': 'มุมพักผ่อน',
  'Design Studio': 'สตูดิโอดีไซน์', 'Dressing Room': 'ห้องแต่งตัว', 'Restroom': 'ห้องน้ำ', 'Kitchen': 'ห้องครัว', 'Dining': 'ห้องทานข้าว', 'Reception': 'แผนกต้อนรับ', 'Work Floor': 'โซนทำงาน',
  'Open floor for everyone': 'พื้นที่เปิดสำหรับทุกคน', 'Crits, pairing and asset reviews': 'รีวิวงานและทำงานคู่', 'Engineering co-working': 'พื้นที่ทำงานร่วมของทีมพัฒนา', 'Campaign war room': 'ห้องวางแผนแคมเปญ',
  'Scheduled meetings join here': 'ประชุมตามนัดเข้าที่นี่', 'Managers and invited guests': 'ผู้จัดการและแขกที่ได้รับเชิญ', 'Silent co-working. Joining starts Focus.': 'ทำงานเงียบ ๆ เข้าห้องแล้วเริ่มโฟกัส',
  'Desk': 'โต๊ะทำงาน', 'Meeting table': 'โต๊ะประชุม', 'Bookshelf': 'ชั้นหนังสือ', 'Knowledge base': 'คลังความรู้', 'Knowledge Base': 'คลังความรู้', 'Cabinet': 'ตู้เอกสาร', 'Archive box': 'กล่องเอกสาร',
  'Printer': 'เครื่องพิมพ์', 'Submit work': 'ส่งงาน', 'Sorting desk': 'โต๊ะคัดแยกเอกสาร', 'Lobby': 'ล็อบบี้', 'Employees & HR': 'พนักงานและฝ่ายบุคคล', 'Director desk': 'โต๊ะผู้อำนวยการ',
  'Manager desk': 'โต๊ะผู้จัดการ', 'Studio desk': 'โต๊ะสตูดิโอ', 'Lounge table': 'โต๊ะเลานจ์', 'Kitchen table': 'โต๊ะครัว', 'Dining table': 'โต๊ะทานข้าว', 'Beanbag': 'บีนแบ็ก',
  'Yoga ball': 'ลูกบอลโยคะ', '25 min focus': 'โฟกัส 25 นาที', 'Coffee machine': 'เครื่องชงกาแฟ', 'Coffee break': 'พักกาแฟ', 'Water cooler': 'ตู้น้ำดื่ม', 'Fridge': 'ตู้เย็น',
  'Mirror': 'กระจก', 'Wardrobe': 'ตู้เสื้อผ้า', 'Clothes rack': 'ราวแขวนเสื้อ', 'Dressing room': 'ห้องแต่งตัว', 'Plant': 'ต้นไม้', 'Wall clock': 'นาฬิกาแขวน', 'Whiteboard': 'ไวท์บอร์ด',
  'Refreshing': 'สดชื่น', 'You drank a glass of cold water.': 'ดื่มน้ำเย็นไปหนึ่งแก้ว', 'You watered the plant.': 'รดน้ำต้นไม้แล้ว', 'Someone labelled their milk. Better not.': 'มีคนเขียนชื่อไว้บนกล่องนม อย่าแตะดีกว่า',
  'Full of lunch boxes with names on them.': 'เต็มไปด้วยกล่องข้าวที่เขียนชื่อไว้', 'Status set to Away for 10 minutes.': 'ตั้งสถานะเป็นไม่อยู่ 10 นาที',
  // HUD & voice
  'Not in a room · walk into one': 'ยังไม่ได้อยู่ในห้อง · เดินเข้าห้องได้เลย', 'Microphone on': 'ไมค์เปิด', 'Microphone off': 'ไมค์ปิด', 'Headphones on': 'หูฟังเปิด', 'Headphones off': 'หูฟังปิด',
  'Share screen': 'แชร์หน้าจอ', 'Leave room': 'ออกจากห้อง', 'Press T to talk': 'กด T เพื่อพูด', 'Say something': 'พูดอะไรสักอย่าง', 'Mute': 'ปิดไมค์', 'Unmute': 'เปิดไมค์', 'Deafen': 'ปิดหูฟัง', 'Undeafen': 'เปิดหูฟัง',
  'Stop sharing': 'หยุดแชร์', 'Share file': 'แชร์ไฟล์', 'Leave': 'ออก', 'Join': 'เข้าร่วม', 'Joined': 'เข้าแล้ว', 'Knock': 'เคาะประตู', 'Simulated audio': 'เสียงจำลอง',
  'Mic and headphone controls are at the bottom left.': 'ปุ่มไมค์และหูฟังอยู่มุมล่างซ้าย', 'Screen sharing started': 'เริ่มแชร์หน้าจอแล้ว', 'Simulated: others in the room see a placeholder.': 'จำลอง: คนในห้องจะเห็นภาพแทน',
  'Knock sent': 'เคาะประตูแล้ว', 'People in the Private room have been notified.': 'แจ้งคนในห้องส่วนตัวแล้ว', 'Incoming call': 'สายเรียกเข้า', 'Calling…': 'กำลังโทร…', 'On call': 'กำลังคุย',
  'Accept call': 'รับสาย', 'Decline call': 'วางสาย', 'Hang up': 'วางสาย', 'End': 'วางสาย', 'Call declined': 'ปฏิเสธสายแล้ว', 'Call ended': 'จบการโทร', 'Call': 'โทร',
  // onboarding
  'Enter office': 'เข้าออฟฟิศ', 'Get dressed': 'แต่งตัว', 'Position': 'ตำแหน่ง', 'Create character': 'สร้างตัวละคร', 'Into the office': 'เข้าสู่ออฟฟิศ',
  'Welcome to Northdesk': 'ยินดีต้อนรับสู่ Northdesk', 'A pixel office for your team. Tasks, meetings, chat and calls all happen on this floor: walk to a desk, the printer or a room to use them.': 'ออฟฟิศพิกเซลของทีมคุณ งาน ประชุม แชท และการโทรอยู่บนชั้นนี้ทั้งหมด เดินไปที่โต๊ะ เครื่องพิมพ์ หรือห้องต่าง ๆ เพื่อใช้งาน',
  'Continue as': 'เข้าต่อในชื่อ', 'Enter as a new person': 'เข้าเป็นคนใหม่', 'How do you want your character to look?': 'อยากให้ตัวละครของคุณหน้าตาแบบไหน',
  'Dress myself': 'แต่งเอง', 'Pick hair, skin tone, clothes and accessories.': 'เลือกทรงผม สีผิว เสื้อผ้า และเครื่องประดับเอง', 'Random outfit': 'แรนด้อม', 'Roll a look and shuffle until you like it.': 'สุ่มลุคแล้วสุ่มใหม่จนกว่าจะชอบ',
  'Dress yourself': 'แต่งตัวเอง', 'Changes show on the preview. You can come back any time through the Dressing Room on the floor.': 'ดูผลได้ทันทีในตัวอย่าง กลับมาแก้ได้ตลอดที่ห้องแต่งตัวในออฟฟิศ',
  'Shuffle until it feels like you.': 'สุ่มจนกว่าจะได้ลุคที่ใช่', 'Customize instead': 'แต่งเองแทน', 'Shuffle again': 'สุ่มอีกครั้ง', 'Choose your position': 'เลือกตำแหน่งในบริษัท',
  'Your department decides where your desk is. Your role decides what you can do.': 'แผนกเป็นตัวกำหนดที่ตั้งโต๊ะของคุณ บทบาทเป็นตัวกำหนดสิ่งที่คุณทำได้', 'Department': 'แผนก', 'Role': 'บทบาท', 'Job title': 'ชื่อตำแหน่ง',
  'Work on your tasks, submit work, join rooms and meetings.': 'ทำงานที่ได้รับ ส่งงาน เข้าห้องและเข้าประชุม', 'Assign tasks, review submissions, run projects and approve leave.': 'มอบหมายงาน ตรวจงาน ดูแลโปรเจกต์ และอนุมัติการลา',
  'Everything a manager can do, plus people, permissions and settings.': 'ทำได้ทุกอย่างแบบผู้จัดการ และจัดการคน สิทธิ์ และการตั้งค่า', 'Create your character': 'สร้างตัวละคร', 'What should colleagues call you?': 'อยากให้เพื่อนร่วมงานเรียกคุณว่าอะไร',
  'Your name': 'ชื่อของคุณ', 'Type your name': 'พิมพ์ชื่อของคุณ', 'It is shown above your character.': 'ชื่อนี้จะแสดงเหนือหัวตัวละคร', 'Your desk': 'โต๊ะของคุณ',
  'Decorate my desk': 'แต่งโต๊ะเอง', 'Choose a plant, mug, desk item and name plate.': 'เลือกต้นไม้ แก้ว ของบนโต๊ะ และป้ายชื่อ', 'Random for now': 'แรนด้อมแต่งทีหลัง', 'Get a random setup and decorate later from your Profile.': 'สุ่มไว้ก่อน แล้วค่อยแต่งทีหลังที่หน้าโปรไฟล์',
  'Decorate your desk': 'แต่งโต๊ะ', 'Here is how the office works:': 'วิธีใช้ออฟฟิศ:', 'Walk': 'เดิน', 'WASD or arrow keys, or click the floor': 'WASD หรือปุ่มลูกศร หรือคลิกที่พื้น', 'Use things': 'ใช้งานของ',
  'Face an object and press E, or click it': 'หันหน้าเข้าหาของแล้วกด E หรือคลิกที่ของ', 'My Tasks: create, update and submit work': 'งานของฉัน: สร้าง อัปเดต และส่งงาน', 'Rooms': 'ห้อง', 'Walk in to join the voice room; walk out to leave': 'เดินเข้าเพื่อเข้าห้องเสียง เดินออกเพื่อออก',
  'Mic & headphones': 'ไมค์และหูฟัง', 'Bottom left, works anywhere': 'มุมล่างซ้าย ใช้ได้ทุกที่', 'Talk': 'พูดคุย', 'Press T to say something out loud': 'กด T เพื่อพูดให้คนรอบตัวเห็น', 'Hotbar': 'แถบเครื่องมือ',
  'Number keys 1–0 open the tools': 'กดเลข 1–0 เพื่อเปิดเครื่องมือ', 'Change your outfit any time': 'เปลี่ยนชุดได้ตลอด', 'Enter the office': 'เข้าสู่ออฟฟิศ', 'Next': 'ถัดไป', 'Back': 'ย้อนกลับ', 'Cancel': 'ยกเลิก',
  'Walk to your desk and press E to open your tasks.': 'เดินไปที่โต๊ะแล้วกด E เพื่อเปิดงานของคุณ', 'Welcome back': 'ยินดีต้อนรับกลับมา', 'Progress': 'ความคืบหน้า',
  // editor
  'Skin tone': 'สีผิว', 'Skin': 'ผิว', 'Hairstyle': 'ทรงผม', 'Hair': 'ผม', 'Hair color': 'สีผม', 'Top': 'เสื้อ', 'Top color': 'สีเสื้อ', 'Bottom': 'ท่อนล่าง', 'Bottom color': 'สีท่อนล่าง', 'Eyewear': 'แว่นตา',
  'Headwear': 'หมวก/ที่คาดผม', 'Headwear color': 'สีหมวก', 'Desk item': 'ของบนโต๊ะ', 'Mug': 'แก้ว', 'Name plate': 'ป้ายชื่อ', 'Shuffle': 'สุ่ม', 'Save': 'บันทึก', 'Random': 'สุ่ม', 'OK': 'ตกลง',
  'Hue': 'สี', 'Saturation': 'ความสด', 'Brightness': 'ความสว่าง', 'Rotate left': 'หมุนซ้าย', 'Rotate right': 'หมุนขวา', 'Previous': 'ก่อนหน้า',
  'Short': 'สั้น', 'Long': 'ยาว', 'Bob': 'บ็อบ', 'Bun': 'มวย', 'Ponytail': 'หางม้า', 'Spiky': 'ตั้งชี้', 'Curly': 'หยิก', 'Bald': 'หัวโล้น', 'Tee': 'เสื้อยืด', 'Shirt': 'เชิ้ต', 'Hoodie': 'ฮู้ดดี้',
  'Blazer': 'เบลเซอร์', 'Sweater': 'สเวตเตอร์', 'Dress': 'เดรส', 'Pants': 'กางเกงขายาว', 'Shorts': 'กางเกงขาสั้น', 'Skirt': 'กระโปรง', 'None': 'ไม่มี', 'Glasses': 'แว่นสายตา', 'Round': 'แว่นกลม',
  'Shades': 'แว่นกันแดด', 'Cap': 'แก๊ป', 'Beanie': 'บีนนี่', 'Headphones': 'หูฟัง', 'Flower': 'ดอกไม้', 'Cactus': 'กระบองเพชร', 'Succulent': 'ไม้อวบน้ำ', 'Bonsai': 'บอนไซ', 'Lamp': 'โคมไฟ',
  'Photo': 'กรอบรูป', 'Books': 'หนังสือ', 'Figurine': 'ฟิกเกอร์', 'Cat': 'ตุ๊กตาแมว', 'Outfit saved': 'บันทึกชุดแล้ว', 'Everyone in the office sees your new look.': 'ทุกคนในออฟฟิศจะเห็นลุคใหม่ของคุณ',
  'Desk decorated': 'แต่งโต๊ะเรียบร้อย', 'Walk to your desk to see it.': 'เดินไปที่โต๊ะเพื่อดูได้เลย',
  // common actions
  'New task': 'งานใหม่', 'Schedule meeting': 'นัดประชุม', 'Start focus': 'เริ่มโฟกัส', 'Edit': 'แก้ไข', 'Delete': 'ลบ', 'Add': 'เพิ่ม', 'Post': 'โพสต์', 'Send': 'ส่ง', 'Approve': 'อนุมัติ', 'Decline': 'ปฏิเสธ',
  'Message': 'ข้อความ', 'Details': 'รายละเอียด', 'View all': 'ดูทั้งหมด', 'All': 'ทั้งหมด', 'More': 'เพิ่มเติม', 'Remove': 'นำออก', 'Copy link': 'คัดลอกลิงก์', 'Copied': 'คัดลอกแล้ว', 'Copy this link': 'คัดลอกลิงก์นี้',
  'Create & notify': 'สร้างและแจ้งเตือน', 'Save changes': 'บันทึกการแก้ไข', 'Mark all read': 'อ่านทั้งหมดแล้ว', 'Mark as read': 'ทำเครื่องหมายว่าอ่านแล้ว', 'Pin': 'ปักหมุด', 'Unpin': 'เลิกปักหมุด', 'Upload': 'อัปโหลด',
  'Open chat': 'เปิดแชท', 'New message': 'ข้อความใหม่', 'Huddle': 'คุยด่วน', 'Link task': 'แนบงาน', 'Link a task': 'แนบงาน', 'Attach files': 'แนบไฟล์', 'Task': 'งาน', 'File': 'ไฟล์', 'Add link': 'เพิ่มลิงก์',
  // dashboard
  'Good morning': 'อรุณสวัสดิ์', 'Good afternoon': 'สวัสดีตอนบ่าย', 'Good evening': 'สวัสดีตอนเย็น', 'Your tasks': 'งานของคุณ', 'Whole company': 'ทั้งบริษัท', 'Employee view': 'มุมมองพนักงาน',
  'Manager view': 'มุมมองผู้จัดการ', 'Admin view': 'มุมมองแอดมิน', 'Total tasks': 'งานทั้งหมด', 'Active': 'กำลังทำ', 'Pending review': 'รอตรวจ', 'Upcoming deadlines': 'กำหนดส่งที่ใกล้เข้ามา',
  'All tasks': 'งานทั้งหมด', 'Nothing due this week': 'สัปดาห์นี้ไม่มีงานต้องส่ง', 'New deadlines show up here.': 'กำหนดส่งใหม่จะขึ้นที่นี่', 'Upcoming meetings': 'ประชุมที่กำลังจะถึง',
  'No meetings coming up': 'ยังไม่มีประชุม', 'Schedule one': 'นัดประชุม', 'My submissions': 'งานที่ฉันส่ง', 'Pending approvals': 'รออนุมัติ', 'No submissions yet': 'ยังไม่มีการส่งงาน',
  'Submit work from any task.': 'ส่งงานได้จากทุกงาน', 'Nothing waiting for you': 'ไม่มีอะไรรอคุณอยู่', 'New submissions appear here.': 'งานที่ส่งเข้ามาใหม่จะขึ้นที่นี่', 'Team workload': 'ภาระงานของทีม',
  'Project progress': 'ความคืบหน้าโปรเจกต์', 'All milestones reached': 'ถึงทุกเป้าหมายแล้ว', 'Online now': 'ออนไลน์ตอนนี้', 'Active rooms': 'ห้องที่มีคน', 'No one in a room.': 'ยังไม่มีใครอยู่ในห้อง',
  'Recent activity': 'กิจกรรมล่าสุด', 'You are all caught up': 'ไม่มีอะไรค้างแล้ว', 'Northdesk': 'Northdesk', 'Someone': 'บางคน', 'Today': 'วันนี้', 'Tomorrow': 'พรุ่งนี้', 'Yesterday': 'เมื่อวาน', 'done': 'เสร็จแล้ว',
  // tasks & projects
  'Assigned to me': 'ที่ได้รับมอบหมาย', 'I review': 'ที่ฉันตรวจ', 'My team': 'ทีมของฉัน', 'All statuses': 'ทุกสถานะ', 'All priorities': 'ทุกความสำคัญ', 'All projects': 'ทุกโปรเจกต์', 'Filter by title or ID': 'กรองตามชื่อหรือรหัส',
  'Clear filters': 'ล้างตัวกรอง', 'List': 'รายการ', 'Kanban': 'คันบัน', 'Timeline': 'ไทม์ไลน์', 'No tasks match': 'ไม่พบงาน', 'Try another filter or create a task.': 'ลองตัวกรองอื่นหรือสร้างงานใหม่', 'ID': 'รหัส',
  'Project': 'โปรเจกต์', 'Assignees': 'ผู้รับผิดชอบ', 'Priority': 'ความสำคัญ', 'Status': 'สถานะ', 'Due': 'กำหนดส่ง', 'Drop tasks here': 'ลากงานมาวางที่นี่', 'No tasks to plot': 'ไม่มีงานให้แสดง',
  'Milestone': 'เป้าหมาย', 'Progress rolls up from tasks automatically.': 'ความคืบหน้าคำนวณจากงานโดยอัตโนมัติ', 'New project': 'โปรเจกต์ใหม่', 'Select a project to see its board.': 'เลือกโปรเจกต์เพื่อดูบอร์ด',
  'Owner': 'เจ้าของ', 'Reviewers': 'ผู้ตรวจ', 'Last update': 'อัปเดตล่าสุด', 'Description': 'รายละเอียด', 'Depends on': 'ต้องรอ', 'Blocking': 'งานที่รออยู่', 'Subtasks': 'งานย่อย', 'Add a subtask': 'เพิ่มงานย่อย',
  'Attachments': 'ไฟล์แนบ', 'None': 'ไม่มี', 'Comments': 'ความคิดเห็น', 'No comments yet': 'ยังไม่มีความคิดเห็น', 'Write a comment. Use @Name to mention.': 'เขียนความคิดเห็น ใช้ @ชื่อ เพื่อแท็ก', 'Activity': 'ประวัติ',
  'Start working': 'เริ่มทำงาน', 'Delete task': 'ลบงาน', 'From meeting': 'จากการประชุม', 'Task not found': 'ไม่พบงาน', 'This task was deleted.': 'งานนี้ถูกลบแล้ว', 'Title': 'ชื่องาน', 'No project': 'ไม่มีโปรเจกต์',
  'Due date': 'วันกำหนดส่ง', 'Due time': 'เวลากำหนดส่ง', 'Employees can only assign tasks to themselves.': 'พนักงานมอบหมายงานได้เฉพาะตัวเอง', 'Hold Ctrl/Cmd to choose several. Blocked tasks cannot start until these are done.': 'กด Ctrl/Cmd ค้างเพื่อเลือกหลายงาน งานนี้จะเริ่มไม่ได้จนกว่างานที่เลือกจะเสร็จ',
  'One per line': 'บรรทัดละหนึ่งรายการ', 'Pick at least one assignee': 'เลือกผู้รับผิดชอบอย่างน้อยหนึ่งคน', 'Task updated': 'อัปเดตงานแล้ว', 'Submit work for review': 'ส่งงานให้ตรวจ', 'Links': 'ลิงก์', 'Files': 'ไฟล์',
  'One per line: pull requests, docs, designs': 'บรรทัดละหนึ่งลิงก์ เช่น PR เอกสาร งานออกแบบ', 'Note for the reviewer': 'โน้ตถึงผู้ตรวจ', 'What changed and what to check': 'เปลี่ยนอะไรไปบ้าง และควรตรวจอะไร', 'Submit': 'ส่ง',
  'Nothing to submit': 'ไม่มีงานให้ส่ง', 'You have no open tasks assigned to you.': 'คุณไม่มีงานที่ค้างอยู่', 'Add a link, file or note': 'เพิ่มลิงก์ ไฟล์ หรือโน้ต', 'Finish its dependencies first.': 'ต้องทำงานที่รออยู่ให้เสร็จก่อน',
  'Submit work for review in': 'ส่งงานให้ตรวจ', 'A reviewer approves the task to complete it.': 'งานจะเสร็จเมื่อผู้ตรวจอนุมัติ', 'You cannot move this task': 'คุณย้ายงานนี้ไม่ได้', 'Only assignees, reviewers and managers can.': 'ทำได้เฉพาะผู้รับผิดชอบ ผู้ตรวจ และผู้จัดการ',
  'Overdue is set automatically': 'สถานะเลยกำหนดถูกตั้งอัตโนมัติ', 'Northdesk marks tasks overdue when the deadline passes.': 'ระบบจะตั้งเป็นเลยกำหนดเมื่อเลยเวลาส่ง', 'Assignees submit work': 'ผู้รับผิดชอบเป็นคนส่งงาน',
  'The task moves to Pending Review when they submit.': 'งานจะย้ายไปรอตรวจเมื่อมีการส่ง',
  // submissions
  'To review': 'รอตรวจ', 'Submitted by': 'ส่งโดย', 'When': 'เมื่อ', 'Version': 'เวอร์ชัน', 'Nothing waiting for your review': 'ไม่มีงานรอคุณตรวจ', 'Submit work from a task when it is ready.': 'ส่งงานจากหน้างานเมื่อพร้อม',
  'Upload → review → approve or request changes → resubmit. Approval completes the task.': 'อัปโหลด → ตรวจ → อนุมัติหรือขอแก้ไข → ส่งใหม่ เมื่ออนุมัติงานจะเสร็จทันที', 'Request revision': 'ขอแก้ไข', 'Approve & complete task': 'อนุมัติและปิดงาน',
  'Revision requested': 'ขอแก้ไขแล้ว', 'Add feedback': 'เพิ่มคำแนะนำ', 'Tell them what to change.': 'บอกว่าต้องแก้อะไร', 'The assignee was notified.': 'แจ้งผู้รับผิดชอบแล้ว', 'Submission not found': 'ไม่พบการส่งงาน',
  'Assignees notified, dependent tasks unblocked.': 'แจ้งผู้รับผิดชอบแล้ว งานที่รออยู่เริ่มได้แล้ว', 'Your work was approved and the task is complete.': 'งานของคุณได้รับอนุมัติและปิดงานแล้ว',
  // follow-ups
  'Run check now': 'ตรวจเดี๋ยวนี้', 'Escalate': 'ส่งต่อหัวหน้า', 'Nudge': 'สะกิด', 'Nudge sent': 'สะกิดแล้ว', 'Needs attention': 'ต้องดูแล', 'Reason': 'เหตุผล', 'Assignee': 'ผู้รับผิดชอบ', 'Due soon': 'ใกล้กำหนด',
  'No updates': 'ไม่มีความคืบหน้า', 'Review waiting': 'รอตรวจนาน', 'Everything is on track': 'ทุกอย่างเป็นไปตามแผน', 'Nothing is overdue, stale or due in the next 3 days.': 'ไม่มีงานเลยกำหนด ค้างนาน หรือต้องส่งใน 3 วัน',
  'Reminder rules': 'กฎการเตือน', 'Deadline reminders': 'เตือนก่อนกำหนดส่ง', '3 days before': 'ก่อน 3 วัน', '1 day before': 'ก่อน 1 วัน', 'On the due date': 'วันกำหนดส่ง', 'Flag tasks with no progress after': 'แจ้งเตือนงานที่ไม่มีความคืบหน้าเกิน',
  'Escalate to team lead after': 'ส่งต่อหัวหน้าทีมเมื่อเลยกำหนด', 'Overdue reminder frequency': 'ความถี่การเตือนงานเลยกำหนด', 'Once': 'ครั้งเดียว', 'Every day until done': 'ทุกวันจนกว่าจะเสร็จ',
  'Notify reviewers and managers about delayed work': 'แจ้งผู้ตรวจและผู้จัดการเมื่องานล่าช้า', 'Managers and admins can change these rules.': 'ผู้จัดการและแอดมินแก้กฎเหล่านี้ได้', 'No new reminders': 'ไม่มีการเตือนใหม่',
  'Everyone already has the reminders they need.': 'ทุกคนได้รับการเตือนครบแล้ว', 'Northdesk checks deadlines every few seconds and nudges the right people. Notifications respect Do Not Disturb.': 'ระบบตรวจกำหนดส่งทุกไม่กี่วินาทีและเตือนคนที่เกี่ยวข้อง โดยเคารพโหมดห้ามรบกวน',
  'Escalated': 'ส่งต่อหัวหน้าแล้ว',
  // meetings & calendar
  'Happening now': 'กำลังประชุม', 'Upcoming': 'กำลังจะมาถึง', 'Past meetings': 'ประชุมที่ผ่านมา', 'No upcoming meetings': 'ยังไม่มีประชุม', 'No past meetings': 'ยังไม่มีประชุมที่ผ่านมา',
  'Schedule, RSVP, take notes and turn decisions into tasks.': 'นัดประชุม ตอบรับ จดโน้ต และเปลี่ยนข้อสรุปเป็นงาน', 'Date': 'วันที่', 'Start': 'เริ่ม', 'Duration': 'ระยะเวลา', 'Voice room': 'ห้องเสียง', 'Agenda': 'วาระ',
  'Invite': 'เชิญ', 'Availability': 'ตารางว่าง', 'Find a free time': 'หาเวลาที่ว่าง', 'Schedule & invite': 'นัดและส่งคำเชิญ', 'Free': 'ว่าง', 'Outside working hours': 'นอกเวลางาน',
  'Pick people to check their calendars.': 'เลือกคนเพื่อดูตารางเวลา', 'Free slot found': 'พบเวลาว่าง', 'No common free slot': 'ไม่มีเวลาที่ว่างตรงกัน', 'Meeting scheduled': 'นัดประชุมแล้ว', 'Invite at least one person': 'เชิญอย่างน้อยหนึ่งคน',
  'Your RSVP': 'การตอบรับของคุณ', 'Participants': 'ผู้เข้าร่วม', 'Attended': 'เข้าร่วมแล้ว', 'Notes': 'โน้ต', 'Save notes': 'บันทึกโน้ต', 'Notes saved': 'บันทึกโน้ตแล้ว', 'AI summary': 'สรุปด้วย AI',
  'All participants agreed to AI processing of these notes': 'ผู้เข้าร่วมทุกคนยินยอมให้ AI ประมวลผลโน้ตนี้', 'Summarize & extract action items': 'สรุปและดึงสิ่งที่ต้องทำ', 'Rule-based': 'ใช้กฎ', 'Claude': 'Claude',
  'Action items': 'สิ่งที่ต้องทำ', 'Action item': 'สิ่งที่ต้องทำ', 'Create task': 'สร้างงาน', 'Create tasks for all open items': 'สร้างงานจากทุกรายการ', 'None yet': 'ยังไม่มี', 'Decisions, open questions, who does what': 'ข้อสรุป คำถามค้าง ใครทำอะไร',
  'Meeting not found': 'ไม่พบการประชุม', 'Consent needed': 'ต้องได้รับความยินยอม', 'Add notes first': 'เพิ่มโน้ตก่อน', 'Summary ready': 'สรุปเสร็จแล้ว', 'Live now': 'กำลังประชุม',
  'Meetings, deadlines, milestones, company events, schedules and leave in one place.': 'ประชุม กำหนดส่ง เป้าหมาย กิจกรรมบริษัท ตารางงาน และวันลา รวมไว้ที่เดียว', 'Schedule block': 'เพิ่มตารางส่วนตัว',
  'Export .ics': 'ส่งออก .ics', 'Connect Google Calendar': 'เชื่อม Google Calendar', 'My calendar': 'ปฏิทินของฉัน', 'Team': 'ทีม', 'Company': 'บริษัท', 'Day': 'วัน', 'Week': 'สัปดาห์', 'Month': 'เดือน',
  'Meetings': 'ประชุม', 'Deadlines': 'กำหนดส่ง', 'Milestones': 'เป้าหมาย', 'Schedules': 'ตารางงาน', 'Time off': 'วันลา', 'Previous': 'ก่อนหน้า', 'Free': 'ว่าง', 'Add to my schedule': 'เพิ่มในตารางของฉัน',
  'Add block': 'เพิ่ม', 'From': 'จาก', 'To': 'ถึง', 'Blocks show as busy when colleagues schedule meetings.': 'ช่วงเวลานี้จะแสดงว่าไม่ว่างเมื่อมีคนนัดประชุม', 'Added to your schedule': 'เพิ่มในตารางแล้ว', 'Delete block': 'ลบช่วงเวลา',
  'Google Calendar': 'Google Calendar', 'Connect': 'เชื่อมต่อ', 'Disconnect': 'ยกเลิกการเชื่อมต่อ', 'Sync now': 'ซิงก์ตอนนี้', 'Calendar synced': 'ซิงก์ปฏิทินแล้ว',
  // chat
  'Channels': 'ช่องแชท', 'Groups': 'กลุ่ม', 'Direct messages': 'ข้อความส่วนตัว', 'Channels, group chats and direct messages. Type T-123 to link a task.': 'ช่องแชท แชทกลุ่ม และข้อความส่วนตัว พิมพ์ T-123 เพื่อแนบงาน',
  'No messages yet': 'ยังไม่มีข้อความ', 'Say hello.': 'ทักทายกันหน่อย', 'Create a task from this message': 'สร้างงานจากข้อความนี้', 'To': 'ถึง', 'Group name': 'ชื่อกลุ่ม', 'Only used when you pick more than one person': 'ใช้เมื่อเลือกมากกว่าหนึ่งคน',
  'Pick someone': 'เลือกคน', 'Company-wide chatter': 'คุยกันทั้งบริษัท', 'Design crit and assets': 'รีวิวดีไซน์และไฟล์งาน', 'Engineering': 'วิศวกรรม', 'Campaigns': 'แคมเปญ',
  // people / office
  'See who is around, drop into a room, and keep your own availability honest.': 'ดูว่าใครอยู่บ้าง เข้าห้อง และอัปเดตสถานะของตัวเอง', 'People': 'ผู้คน', 'Everyone': 'ทุกคน', 'Available': 'ว่าง', 'Busy & focused': 'ไม่ว่างและโฟกัส',
  'Away & offline': 'ไม่อยู่และออฟไลน์', 'Name': 'ชื่อ', 'Room': 'ห้อง', 'Empty': 'ว่าง', 'Quick availability': 'สถานะด่วน', 'Auto status is on': 'สถานะอัตโนมัติเปิดอยู่', 'DND 1h': 'ห้ามรบกวน 1 ชม.', 'Focus 25m': 'โฟกัส 25 นาที',
  'Simulated teammates': 'เพื่อนร่วมงานจำลอง', 'Call a colleague': 'โทรหาเพื่อนร่วมงาน', 'Simulate incoming call': 'จำลองสายเรียกเข้า', 'Nobody here': 'ไม่มีใครอยู่',
  'Directory': 'รายชื่อ', 'Departments': 'แผนก', 'Attendance': 'การเข้างาน', 'Workload': 'ภาระงาน', 'Requests': 'คำขอ', 'Directory, departments, attendance, leave, workload and internal requests.': 'รายชื่อ แผนก การเข้างาน การลา ภาระงาน และคำขอภายใน',
  'Search people': 'ค้นหาคน', 'All departments': 'ทุกแผนก', 'Add employee': 'เพิ่มพนักงาน', 'Head': 'หัวหน้า', 'Members': 'สมาชิก', 'Open tasks': 'งานค้าง', 'Add department': 'เพิ่มแผนก', 'Check in': 'เช็กอิน',
  'Check out': 'เช็กเอาต์', 'You have not checked in today.': 'วันนี้คุณยังไม่ได้เช็กอิน', 'Today in': 'เข้างานวันนี้', 'Out': 'ออกงาน', 'Last 2 weeks': '2 สัปดาห์ล่าสุด', 'Checked in': 'เช็กอินแล้ว', 'Checked out': 'เช็กเอาต์แล้ว',
  'Request leave': 'ขอลา', 'Type': 'ประเภท', 'Dates': 'วันที่', 'Vacation': 'ลาพักร้อน', 'Sick': 'ลาป่วย', 'Personal': 'ลากิจ', 'Work from home': 'ทำงานที่บ้าน', 'Send request': 'ส่งคำขอ', 'Leave requested': 'ส่งคำขอลาแล้ว',
  'Your manager was notified.': 'แจ้งผู้จัดการแล้ว', 'Vacation balance:': 'วันลาพักร้อนคงเหลือ:', 'New request': 'คำขอใหม่', 'New internal request': 'คำขอภายในใหม่', 'What do you need?': 'ต้องการอะไร', 'Category': 'หมวดหมู่',
  'IT, facilities, HR and finance requests in one queue.': 'คำขอด้านไอที อาคาร บุคคล และการเงิน รวมในคิวเดียว', 'Request': 'คำขอ', 'Submit request': 'ส่งคำขอ', 'Request submitted': 'ส่งคำขอแล้ว', 'You will be notified when it moves.': 'จะแจ้งเตือนเมื่อมีความคืบหน้า',
  'Unassigned': 'ยังไม่มีผู้รับผิดชอบ', 'No requests': 'ยังไม่มีคำขอ', 'Facilities': 'อาคารสถานที่', 'Finance': 'การเงิน', 'HR': 'บุคคล', 'IT': 'ไอที', 'Full name': 'ชื่อ-นามสกุล', 'Work email': 'อีเมลที่ทำงาน', 'Employee added': 'เพิ่มพนักงานแล้ว',
  'They appear offline until they sign in.': 'จะแสดงเป็นออฟไลน์จนกว่าจะเข้าระบบ', 'Email': 'อีเมล', 'Phone': 'โทรศัพท์', 'Time zone': 'เขตเวลา',
  // files, announcements, reports
  'Shared files and the company knowledge base.': 'ไฟล์ที่แชร์และคลังความรู้ของบริษัท', 'Search files': 'ค้นหาไฟล์', 'Search articles': 'ค้นหาบทความ', 'Ask the assistant': 'ถามผู้ช่วย AI', 'New article': 'บทความใหม่', 'Folder': 'โฟลเดอร์',
  'Size': 'ขนาด', 'Linked task': 'งานที่เกี่ยวข้อง', 'Updated': 'อัปเดต', 'Shared': 'แชร์ร่วม', 'No files here': 'ไม่มีไฟล์', 'Upload a file or pick another folder.': 'อัปโหลดไฟล์หรือเลือกโฟลเดอร์อื่น', 'Storage': 'พื้นที่เก็บ',
  'Uploaded files open during this session only. File names and details are kept in this browser.': 'ไฟล์ที่อัปโหลดเปิดได้ในรอบนี้เท่านั้น ชื่อและรายละเอียดไฟล์เก็บไว้ในเบราว์เซอร์นี้', 'No articles match': 'ไม่พบบทความ', 'Tags': 'แท็ก', 'Body': 'เนื้อหา', 'Publish article': 'เผยแพร่บทความ',
  'Company news. Urgent posts reach people even during Do Not Disturb.': 'ข่าวบริษัท ประกาศด่วนจะส่งถึงทุกคนแม้อยู่ในโหมดห้ามรบกวน', 'New announcement': 'ประกาศใหม่', 'Pin to top': 'ปักไว้ด้านบน', 'Urgent: notify everyone even during Do Not Disturb': 'ด่วน: แจ้งทุกคนแม้อยู่ในโหมดห้ามรบกวน',
  'Post & notify': 'โพสต์และแจ้งเตือน', 'Announcement posted': 'โพสต์ประกาศแล้ว', 'Export CSV': 'ส่งออก CSV', 'Weekly AI report': 'รายงาน AI รายสัปดาห์', 'Completion rate': 'อัตราความสำเร็จ', 'On-time delivery': 'ส่งตรงเวลา',
  'Avg review time': 'เวลาตรวจเฉลี่ย', 'of current tasks are done': 'ของงานปัจจุบันเสร็จแล้ว', 'submission to first decision': 'จากส่งงานถึงผลตรวจครั้งแรก', 'last 2 working weeks': '2 สัปดาห์ทำงานล่าสุด', 'Tasks completed per week': 'งานที่เสร็จต่อสัปดาห์',
  'Last 8 weeks': '8 สัปดาห์ล่าสุด', 'Status mix': 'สัดส่วนสถานะ', 'By department': 'แยกตามแผนก', 'Open': 'เปิด', 'Done (30d)': 'เสร็จ (30 วัน)', 'On time': 'ตรงเวลา',
  'Your personal numbers. Team reports need the View team reports permission.': 'ตัวเลขของคุณเอง รายงานทีมต้องมีสิทธิ์ดูรายงานทีม', 'Company-wide numbers from tasks, reviews and attendance.': 'ตัวเลขทั้งบริษัทจากงาน การตรวจ และการเข้างาน',
  // settings
  'How colleagues see you across Northdesk.': 'สิ่งที่เพื่อนร่วมงานเห็นเกี่ยวกับคุณ', 'Job title': 'ชื่อตำแหน่ง', 'About': 'เกี่ยวกับฉัน', 'Avatar color': 'สีประจำตัว', 'Save profile': 'บันทึกโปรไฟล์', 'Profile saved': 'บันทึกโปรไฟล์แล้ว',
  'Characters on this device': 'ตัวละครในเครื่องนี้', 'Make extra characters to test the flow from another role, for example an employee who submits work and a manager who approves it.': 'สร้างตัวละครเพิ่มเพื่อทดสอบในบทบาทอื่น เช่น พนักงานที่ส่งงานกับผู้จัดการที่อนุมัติ',
  'Playing': 'กำลังเล่น', 'Play as': 'เล่นเป็นตัวนี้', 'Create another character': 'สร้างตัวละครเพิ่ม', 'Office character': 'ตัวละครในออฟฟิศ', 'Open dressing room': 'เปิดห้องแต่งตัว', 'Decorate desk': 'แต่งโต๊ะ',
  'This is how you appear in the Online Office floor view. Pick hair, skin tone, clothes and accessories so nobody looks the same.': 'นี่คือหน้าตาของคุณในออฟฟิศ เลือกผม สีผิว เสื้อผ้า และเครื่องประดับให้ไม่ซ้ำใคร',
  'Control interruptions. Northdesk never records keystrokes, screenshots or app activity.': 'ควบคุมการรบกวน ระบบไม่บันทึกการกดแป้น ภาพหน้าจอ หรือการใช้งานแอป', 'Current status': 'สถานะปัจจุบัน',
  'Silences notifications and declines calls. Messages are kept and shown when DND ends.': 'ปิดเสียงแจ้งเตือนและปฏิเสธสาย ข้อความจะถูกเก็บไว้และแสดงเมื่อหมดเวลา', '30 min': '30 นาที', '1 hour': '1 ชั่วโมง', '2 hours': '2 ชั่วโมง', '4 hours': '4 ชั่วโมง',
  'Until tomorrow 09:00': 'ถึงพรุ่งนี้ 09:00', 'Until tomorrow': 'ถึงพรุ่งนี้', 'Minutes': 'นาที', 'Start custom': 'เริ่มแบบกำหนดเอง', 'Turn off now': 'ปิดตอนนี้', 'Turn off': 'ปิด', 'Focus mode': 'โหมดโฟกัส',
  'A timer that turns on DND, shows Focus to colleagues and restores your status at the end.': 'ตัวจับเวลาที่เปิดห้ามรบกวน แสดงสถานะโฟกัส และคืนสถานะเดิมเมื่อหมดเวลา', 'End session': 'จบเซสชัน', 'End focus': 'จบโฟกัส',
  'Remind me to take a break when a session ends': 'เตือนให้พักเมื่อจบเซสชัน', 'Scheduled DND': 'ตั้งเวลาห้ามรบกวน', 'Turn on DND automatically': 'เปิดห้ามรบกวนอัตโนมัติ', 'Emergency contacts': 'ผู้ติดต่อฉุกเฉิน',
  'These people can reach you during DND and Focus. Their messages and calls come through.': 'คนเหล่านี้ติดต่อคุณได้ระหว่างห้ามรบกวนและโฟกัส', 'Privacy & automatic status': 'ความเป็นส่วนตัวและสถานะอัตโนมัติ', 'Who can see my status': 'ใครเห็นสถานะของฉันได้',
  'Everyone in the workspace': 'ทุกคนในพื้นที่ทำงาน', 'My department only': 'เฉพาะแผนกของฉัน', 'Managers and admins only': 'เฉพาะผู้จัดการและแอดมิน', 'Nobody (appear offline)': 'ไม่มีใคร (แสดงเป็นออฟไลน์)',
  'Set In Meeting automatically from my calendar': 'ตั้งสถานะประชุมอัตโนมัติจากปฏิทิน', 'Visibility updated': 'อัปเดตการมองเห็นแล้ว', 'Do Not Disturb is on': 'เปิดห้ามรบกวนแล้ว', 'Do Not Disturb ended': 'หมดเวลาห้ามรบกวน',
  'Focus mode started': 'เริ่มโหมดโฟกัส', 'Focus ended': 'จบโฟกัสแล้ว', 'Focus session complete': 'จบเซสชันโฟกัส', 'Your previous status is back.': 'กลับเป็นสถานะเดิมแล้ว', 'Open the bell to catch up.': 'เปิดกระดิ่งเพื่อดูย้อนหลัง',
  'Until you turn it off.': 'จนกว่าคุณจะปิด', 'Scheduled Do Not Disturb': 'ห้ามรบกวนตามเวลาที่ตั้ง', 'Status and focus': 'สถานะและโฟกัส',
  'Choose what reaches you. Do Not Disturb and Focus hold everything except urgent items and your emergency contacts.': 'เลือกสิ่งที่จะแจ้งเตือนคุณ โหมดห้ามรบกวนและโฟกัสจะพักทุกอย่างยกเว้นเรื่องด่วนและผู้ติดต่อฉุกเฉิน',
  'Notify me about': 'แจ้งเตือนเมื่อ', 'Task assigned to me': 'มีงานมอบหมายให้ฉัน', 'Overdue tasks': 'งานเลยกำหนด', 'Tasks without updates (managers)': 'งานที่ไม่มีความคืบหน้า (ผู้จัดการ)', 'Submissions to review': 'งานที่ต้องตรวจ',
  'Review results': 'ผลการตรวจ', 'Mentions and direct messages': 'การแท็กและข้อความส่วนตัว', 'Meeting invites and reminders': 'คำเชิญและการเตือนประชุม', 'Calls and missed calls': 'สายเรียกเข้าและสายที่ไม่ได้รับ',
  'Leave requests': 'คำขอลา', 'Internal requests': 'คำขอภายใน', 'Delivery': 'การแสดงผล', 'Show pop-up notifications': 'แสดงป๊อปอัปแจ้งเตือน', 'Muted types still land in the notification center so nothing is lost.': 'ประเภทที่ปิดไว้ยังเก็บในศูนย์แจ้งเตือน ไม่มีอะไรหาย',
  'Admin settings for the whole workspace.': 'การตั้งค่าของแอดมินสำหรับทั้งพื้นที่ทำงาน', 'Only admins can change these settings.': 'เฉพาะแอดมินที่แก้ไขได้', 'Workspace name': 'ชื่อพื้นที่ทำงาน', 'Working hours': 'เวลาทำงาน', 'Set Away after': 'ตั้งเป็นไม่อยู่หลังจาก',
  'Simulate teammates\' activity': 'จำลองกิจกรรมเพื่อนร่วมงาน', 'Save': 'บันทึก', 'Workspace saved': 'บันทึกแล้ว', 'System status': 'สถานะระบบ', 'Demo data': 'ข้อมูลทดลอง', 'Reset demo data': 'รีเซ็ตข้อมูล', 'Yes, reset': 'ใช่ รีเซ็ต',
  'Erase all changes?': 'ลบการเปลี่ยนแปลงทั้งหมด?', 'Demo data reset': 'รีเซ็ตข้อมูลแล้ว', 'Toggle what each role can do. Changes apply immediately.': 'กำหนดสิ่งที่แต่ละบทบาททำได้ มีผลทันที', 'Read only. Admins can change role permissions.': 'ดูได้อย่างเดียว แอดมินแก้สิทธิ์ได้',
  'Permission': 'สิทธิ์', 'left': 'เหลือ', 'Roles': 'บทบาท', 'Language': 'ภาษา',
  // notifications drawer & assistant
  'Unread': 'ยังไม่อ่าน', 'Held': 'ถูกพักไว้', 'Nothing here': 'ไม่มีรายการ', 'held during quiet time': 'พักไว้ระหว่างห้ามรบกวน', 'muted by your settings': 'ปิดไว้ตามการตั้งค่า',
  'These arrived during Do Not Disturb or Focus. They are released when your quiet time ends.': 'ข้อความเหล่านี้มาระหว่างห้ามรบกวนหรือโฟกัส จะแสดงเมื่อหมดเวลา', 'Connected to Claude': 'เชื่อมต่อ Claude แล้ว', 'Offline rules': 'โหมดใช้กฎ',
  'Your workspace data is sent to Claude only when you ask.': 'ข้อมูลจะส่งให้ Claude เฉพาะเมื่อคุณถาม', 'Open on claude.ai to use Claude. Rule-based answers for now.': 'เปิดบน claude.ai เพื่อใช้ Claude ตอนนี้ตอบด้วยกฎ', 'Find tasks at risk': 'หางานที่เสี่ยงล่าช้า',
  'Weekly report': 'รายงานรายสัปดาห์', 'Summarize last meeting': 'สรุปประชุมล่าสุด', 'Ask about your workspace': 'ถามเกี่ยวกับพื้นที่ทำงาน', 'Ask': 'ถาม', 'Thinking…': 'กำลังคิด…', 'Answer': 'คำตอบ', 'Suggested tasks': 'งานที่แนะนำ',
  'Create selected tasks': 'สร้างงานที่เลือก', 'Tasks at risk': 'งานที่เสี่ยงล่าช้า', 'Weekly productivity report': 'รายงานประสิทธิภาพรายสัปดาห์', 'No tasks look at risk right now.': 'ตอนนี้ยังไม่มีงานที่น่าห่วง',
  'What should I focus on today? Who can pick up T-104? Find the leave policy.': 'วันนี้ควรโฟกัสอะไร ใครรับงาน T-104 ได้ นโยบายการลาอยู่ไหน',
  'Product & Projects': 'โปรดักต์และโปรเจกต์', 'UI, UX, graphics and brand': 'UI, UX, กราฟิก และแบรนด์', 'Games, apps and QA': 'เกม แอป และทดสอบระบบ', 'Projects, roadmaps and backlog': 'โปรเจกต์ โรดแมป และแบ็กล็อก',
  'Game Developer': 'นักพัฒนาเกม', 'UI Designer': 'UI ดีไซน์เนอร์', 'UX Designer': 'UX ดีไซน์เนอร์', 'Graphic Designer': 'กราฟิกดีไซน์เนอร์', 'Project Manager': 'โปรเจกต์เมเนเจอร์', 'Product Owner (PO)': 'Product Owner (PO)',
  'Product Manager': 'โปรดักต์เมเนเจอร์', 'Scrum Master': 'สครัมมาสเตอร์', 'Profession': 'อาชีพ',
  'Nearby': 'ระยะใกล้', 'Shout': 'ตะโกน', 'Only people near you hear you': 'เฉพาะคนใกล้ ๆ เท่านั้นที่ได้ยิน', 'Everyone in the office hears you': 'ทุกคนในออฟฟิศได้ยิน', 'People who can hear you': 'จำนวนคนที่ได้ยินคุณ',
  'Shout mode': 'โหมดตะโกน', 'Nearby mode': 'โหมดระยะใกล้', 'Everyone in the office hears you.': 'ทุกคนในออฟฟิศได้ยินคุณ', 'Only people inside the dotted circle hear you.': 'เฉพาะคนในวงประเท่านั้นที่ได้ยิน เหมือนกระซิบ',
  'Your mic is off': 'ไมค์ปิดอยู่', 'Turn the microphone on to talk.': 'เปิดไมค์ก่อนถึงจะพูดได้', 'Mic modes': 'โหมดไมค์', 'Nearby = whisper range, Shout = everyone hears': 'ระยะใกล้ = กระซิบ, ตะโกน = ทุกคนได้ยิน',
  'Make this my desk': 'ตั้งเป็นโต๊ะประจำของฉัน', 'This is your desk now': 'ตอนนี้เป็นโต๊ะของคุณแล้ว', 'You will come back to this seat whenever you are at your desk.': 'ต่อจากนี้ตัวละครจะกลับมานั่งที่นี่',
  'Permanent desk': 'โต๊ะประจำ', 'Sit on a free chair and press E': 'นั่งเก้าอี้ว่างแล้วกด E', 'Desks': 'โต๊ะ', 'Place a new desk': 'วางโต๊ะใหม่', 'Place a desk': 'วางโต๊ะ',
  'Sit on any free chair and press E to make it your permanent desk.': 'นั่งเก้าอี้ว่างตัวไหนก็ได้แล้วกด E เพื่อตั้งเป็นโต๊ะประจำ', 'Click an empty spot on the floor. Esc to cancel.': 'คลิกพื้นที่ว่างเพื่อวางโต๊ะ กด Esc เพื่อยกเลิก',
  'This spot is not free': 'ตรงนี้วางไม่ได้', 'Pick an empty patch of floor, 2 by 2 tiles.': 'เลือกพื้นว่างขนาด 2x2 ช่อง', 'Desk added': 'เพิ่มโต๊ะแล้ว', 'Sit on its chair and press E to make it yours.': 'นั่งที่เก้าอี้แล้วกด E เพื่อตั้งเป็นโต๊ะของคุณ',
  'Desk removed': 'ลบโต๊ะแล้ว', 'Remove this desk': 'ลบโต๊ะนี้', 'Open My Tasks': 'เปิดงานของฉัน', 'Added by': 'เพิ่มโดย', 'Custom desk': 'โต๊ะที่เพิ่ม',
  'You have a desk in': 'คุณมีโต๊ะอยู่ที่',
  'Focusing': 'กำลังโฟกัส', 'In a meeting': 'กำลังประชุม', 'Working on': 'กำลังทำ', 'On a break': 'พักเบรก', 'Viewing': 'กำลังดู', 'Talking in': 'คุยอยู่ใน',
  'Others see a muted mic above your head.': 'คนอื่นจะเห็นไอคอนไมค์ปิดบนหัวคุณ', 'People in range can hear you.': 'คนในระยะได้ยินคุณแล้ว', 'You will not hear anyone. Your mic is off too.': 'คุณจะไม่ได้ยินใคร และไมค์ถูกปิดด้วย',
  'You can hear people again.': 'กลับมาได้ยินคนอื่นแล้ว', 'Status updated': 'อัปเดตสถานะแล้ว', 'Everyone sees what you are working on above your head.': 'ทุกคนจะเห็นงานที่คุณกำลังทำบนหัว', 'Everyone sees it above your head.': 'ทุกคนจะเห็นบนหัวคุณ',
  'Activity cleared': 'ล้างสถานะแล้ว', 'What are you doing?': 'กำลังทำอะไรอยู่', 'e.g. Designing the login screen': 'เช่น ออกแบบหน้าล็อกอิน', 'Set': 'ตั้ง', 'Clear activity': 'ล้างสถานะ',
  'Work on this now': 'กำลังทำงานนี้', 'Showing above your head': 'แสดงบนหัวคุณอยู่',
  'DJ Booth': 'บูธดีเจ', 'DJ booth': 'บูธดีเจ', 'Music': 'เพลง', 'Tap to listen': 'แตะเพื่อฟัง', 'Music volume': 'ระดับเสียงเพลง', 'Volume': 'ระดับเสียง', 'Louder near the DJ booth': 'ยิ่งใกล้บูธยิ่งดัง',
  'Play music for the whole office. Everyone who has the office open hears the same station at the same time.': 'เปิดเพลงให้ทั้งออฟฟิศฟัง ทุกคนที่เปิดออฟฟิศอยู่จะได้ยินสถานีเดียวกันพร้อมกัน',
  'Now playing': 'กำลังเล่น', 'Nothing yet': 'ยังไม่มีเพลง', 'Pick a station below to start the music.': 'เลือกสถานีด้านล่างเพื่อเริ่มเปิดเพลง', 'Stop for everyone': 'หยุดเพลงสำหรับทุกคน', 'Play': 'เล่น', 'Playing': 'กำลังเล่น',
  'Lo-fi office': 'โลไฟออฟฟิศ', 'Coffee jazz': 'แจ๊สร้านกาแฟ', 'Synthwave focus': 'ซินธ์เวฟโฟกัส', 'Rainy café': 'คาเฟ่วันฝนตก', 'YouTube queue': 'คิวลิงก์ YouTube', 'Paste a YouTube link': 'วางลิงก์ YouTube', 'Add to queue': 'เพิ่มเข้าคิว',
  'YouTube cannot play inside this office (embedded players are blocked here). Links open on YouTube in a new tab, and everyone sees what is queued and what the DJ is playing.': 'YouTube เล่นในออฟฟิศนี้ไม่ได้ (ระบบบล็อกการฝังเครื่องเล่น) ลิงก์จะเปิดใน YouTube แท็บใหม่ และทุกคนจะเห็นคิวกับเพลงที่ดีเจกำลังเปิด',
  'On YouTube now': 'กำลังเปิดใน YouTube', 'Mark as playing': 'ตั้งเป็นเพลงที่กำลังเปิด', 'No links yet': 'ยังไม่มีลิงก์', 'Paste a YouTube link to share a song with the office.': 'วางลิงก์ YouTube เพื่อแชร์เพลงให้ทั้งออฟฟิศ',
  'That is not a YouTube link': 'นี่ไม่ใช่ลิงก์ YouTube', 'Added to the queue': 'เพิ่มเข้าคิวแล้ว', 'Marked as now playing': 'ตั้งเป็นเพลงที่กำลังเปิดแล้ว', 'Everyone sees the link in the DJ booth.': 'ทุกคนจะเห็นลิงก์ในบูธดีเจ',
  'In the restroom': 'เข้าห้องน้ำ', 'Having a meal': 'กำลังกินข้าว', 'Working at desk': 'กำลังทำงานที่โต๊ะ', 'Sitting': 'นั่งพัก', 'At the DJ booth': 'อยู่ที่บูธดีเจ', 'Screens': 'จอ', 'screens': 'จอ', 'Laptop': 'แล็ปท็อป',
  'Design team': 'ทีมดีไซน์', 'Product & Operations': 'ทีมโปรดักต์และปฏิบัติการ', 'your team': 'ทีมคุณ',
  'Share music with the office. Paste a YouTube link, then mark what is playing so everyone can listen along.': 'แชร์เพลงให้ทั้งออฟฟิศ วางลิงก์ YouTube แล้วตั้งเพลงที่กำลังเปิด ให้ทุกคนเปิดฟังตามได้',
  'Open on YouTube': 'เปิดใน YouTube', 'Stop': 'หยุด', 'Queue': 'คิว', 'Add a link below and mark it as playing.': 'เพิ่มลิงก์ด้านล่างแล้วกดตั้งเป็นเพลงที่กำลังเปิด',
  'Skip': 'ข้ามเพลง', 'Up next': 'เพลงถัดไป', 'Play now': 'เล่นตอนนี้', 'Move up': 'เลื่อนขึ้น', 'Move down': 'เลื่อนลง', 'Skipped to the next song': 'ข้ามไปเพลงถัดไปแล้ว', 'Queue finished': 'คิวหมดแล้ว',
  'Paste a link to keep the music going.': 'วางลิงก์เพื่อเปิดเพลงต่อ', 'Everyone sees it in the DJ booth.': 'ทุกคนเห็นในบูธดีเจ', 'Press Open on YouTube to listen.': 'กด "เปิดใน YouTube" เพื่อฟัง', 'in line': 'ในคิว',
  'Paste a YouTube link below. It starts as the current song right away.': 'วางลิงก์ YouTube ด้านล่าง เพลงจะขึ้นเป็นเพลงปัจจุบันทันที',
  'Songs play inside the office for everyone at the same time. When a song ends, the next one in the queue starts.': 'เพลงเล่นในออฟฟิศให้ทุกคนฟังพร้อมกัน จบเพลงแล้วจะเล่นเพลงถัดไปในคิวอัตโนมัติ',
  'Could not reach the office server': 'เชื่อมต่อเซิร์ฟเวอร์ออฟฟิศไม่ได้', 'Offline mode': 'โหมดออฟไลน์', 'Could not load the realtime library.': 'โหลดระบบเรียลไทม์ไม่สำเร็จ', 'Hide video': 'ซ่อนวิดีโอ', 'Connection': 'การเชื่อมต่อ',
  'Loading player…': 'กำลังโหลดตัวเล่น…', 'Ready, waiting to start': 'พร้อม รอเริ่มเล่น', 'Song ended': 'จบเพลงแล้ว', 'Paused': 'หยุดชั่วคราว', 'Buffering…': 'กำลังโหลดเพลง…', 'Ready': 'พร้อม',
  'Press ▶ in the video to listen': 'กด ▶ ในวิดีโอเพื่อฟัง', 'Muted by the browser. Tap to listen': 'เบราว์เซอร์ปิดเสียงไว้ กดเพื่อฟัง', 'Blocked by the browser. Tap to listen': 'เบราว์เซอร์บล็อกเสียง กดเพื่อฟัง', '🔊 Tap to listen': '🔊 กดเพื่อฟัง',
  '⏭ Skip': '⏭ ข้ามเพลง', '⏭ Stop': '⏭ หยุด',
  // menu page
  'Every module of the office. You can also walk to objects on the floor: desks, shelves, printer, reception, clock and more.': 'ทุกโมดูลของออฟฟิศ หรือเดินไปที่ของในออฟฟิศได้ เช่น โต๊ะ ชั้นหนังสือ เครื่องพิมพ์ แผนกต้อนรับ นาฬิกา',
  'On the floor': 'บนชั้นออฟฟิศ', 'Lobby sofa': 'โซฟารับแขก', 'Cabinets': 'ตู้เอกสาร', 'Any room': 'ห้องไหนก็ได้', 'Walk in to join its voice room': 'เดินเข้าเพื่อเข้าห้องเสียง', 'Focus 25 min': 'โฟกัส 25 นาที',
  'Coffee break (Away)': 'พักกาแฟ (ไม่อยู่)', 'Change outfit': 'เปลี่ยนชุด',
};
const PATS = [
  [/^(\d+) tasks$/, m => `${m[1]} งาน`], [/^(\d+) open$/, m => `ค้าง ${m[1]}`], [/^(\d+) here$/, m => `อยู่ที่นี่ ${m[1]} คน`], [/^(\d+) connected$/, m => `เชื่อมต่อ ${m[1]} คน`],
  [/^(\d+)\/(\d+) going$/, m => `ไป ${m[1]}/${m[2]} คน`], [/^(\d+) action items$/, m => `สิ่งที่ต้องทำ ${m[1]} รายการ`], [/^To review \((\d+)\)$/, m => `รอตรวจ (${m[1]})`],
  [/^Unread \((\d+)\)$/, m => `ยังไม่อ่าน (${m[1]})`], [/^Held \((\d+)\)$/, m => `พักไว้ (${m[1]})`], [/^(Good morning|Good afternoon|Good evening), (.+)$/, m => `${TH[m[1]]} ${m[2]}`],
  [/^Subtasks$/, () => 'งานย่อย'], [/^Subtasks · (\d+)\/(\d+)$/, m => `งานย่อย · ${m[1]}/${m[2]}`], [/^Open tasks · (\d+)$/, m => `งานค้าง · ${m[1]}`], [/^Participants · (\d+) going$/, m => `ผู้เข้าร่วม · ไป ${m[1]} คน`],
  [/^Version (\d+)$/, m => `เวอร์ชัน ${m[1]}`], [/^Submit version (\d+)$/, m => `ส่งเวอร์ชัน ${m[1]}`], [/^Review v(\d+)$/, m => `ตรวจ v${m[1]}`], [/^(\d+) people$/, m => `${m[1]} คน`],
  [/^(\d+) min$/, m => `${m[1]} นาที`], [/^(\d+) minutes$/, m => `${m[1]} นาที`], [/^(\d+) minutes idle$/, m => `ไม่ใช้งาน ${m[1]} นาที`], [/^(\d+) days?$/, m => `${m[1]} วัน`], [/^(\d+) days? overdue$/, m => `เลยกำหนด ${m[1]} วัน`],
  [/^read by (\d+) of (\d+)$/, m => `อ่านแล้ว ${m[1]} จาก ${m[2]} คน`], [/^(\d+) pts$/, m => `${m[1]} แต้ม`], [/^Welcome back, (.+)$/, m => `ยินดีต้อนรับกลับมา ${m[1]}`], [/^Welcome, (.+)$/, m => `ยินดีต้อนรับ ${m[1]}`],
  [/^You're all set, (.+)$/, m => `พร้อมแล้ว ${m[1]}`], [/^Now playing as (.+)$/, m => `กำลังเล่นเป็น ${m[1]}`], [/^Joined (.+)$/, m => `เข้าห้อง${t(m[1])}แล้ว`], [/^Leave (.+)$/, m => `ออกจาก${t(m[1])}`],
  [/^(\d+)\. (.+)$/, m => `${m[1]}. ${t(m[2])}`], [/^Starts (.+)$/, m => `เริ่ม${m[1]}`], [/^Ended (.+)$/, m => `จบแล้ว ${m[1]}`], [/^Next: (.+)$/, m => `ถัดไป: ${m[1]}`], [/^Ends (.+)$/, m => `สิ้นสุด ${m[1]}`],
  [/^(.+) view$/, m => `มุมมอง${t(m[1])}`], [/^(\d+) done$/, m => `เสร็จ ${m[1]}`], [/^(\d+) overdue$/, m => `เลยกำหนด ${m[1]}`], [/^(\d+) files$/, m => `${m[1]} ไฟล์`], [/^(.+) used$/, m => `ใช้ไป ${m[1]}`],
  [/^(\d+) tasks completed$/, m => `เสร็จ ${m[1]} งาน`], [/^(\d+) of (\d+) days$/, m => `${m[1]} จาก ${m[2]} วัน`], [/^Hallway$/, () => 'ทางเดิน'], [/^E$/, () => 'E'],
  [/^New task: (.+)$/, m => `งานใหม่: ${m[1]}`], [/^(T-\d+) created$/, m => `สร้าง ${m[1]} แล้ว`], [/^(T-\d+) is due today at (.+)$/, m => `${m[1]} ต้องส่งวันนี้ ${m[2]}`], [/^(T-\d+) is due in (\d+) days?$/, m => `${m[1]} ต้องส่งในอีก ${m[2]} วัน`],
  [/^(T-\d+) is overdue$/, m => `${m[1]} เลยกำหนดแล้ว`], [/^(T-\d+) approved$/, m => `${m[1]} ได้รับอนุมัติ`], [/^Revision requested on (T-\d+)$/, m => `ขอแก้ไข ${m[1]}`], [/^New submission: (.+)$/, m => `งานส่งใหม่: ${m[1]}`],
  [/^Submitted (T-\d+) v(\d+)$/, m => `ส่ง ${m[1]} v${m[2]} แล้ว`], [/^(T-\d+) approved and completed$/, m => `${m[1]} อนุมัติและเสร็จแล้ว`], [/^(T-\d+) is blocked$/, m => `${m[1]} ติดงานอื่นอยู่`], [/^(.+) commented on (T-\d+)$/, m => `${m[1]} แสดงความเห็นใน ${m[2]}`],
  [/^Message from (.+)$/, m => `ข้อความจาก ${m[1]}`], [/^Missed call from (.+)$/, m => `สายที่ไม่ได้รับจาก ${m[1]}`], [/^(.+) is in (.+)$/, m => `${m[1]} อยู่ใน${t(m[2])}`], [/^(.+) is offline$/, m => `${m[1]} ออฟไลน์อยู่`],
  [/^(\d+) notifications? arrived while you were (focusing|in Do Not Disturb)$/, m => `มี ${m[1]} การแจ้งเตือนระหว่าง${m[2] === 'focusing' ? 'โฟกัส' : 'ห้ามรบกวน'}`], [/^Until (\d\d:\d\d)\. Messages are kept for later\.$/, m => `ถึง ${m[1]} ข้อความจะเก็บไว้ให้`],
  [/^(\d+) minutes\. Do Not Disturb is on and teammates can see you are focusing\.$/, m => `${m[1]} นาที เปิดห้ามรบกวนแล้ว และทุกคนเห็นว่าคุณกำลังโฟกัส`], [/^Do Not Disturb until (.+)$/, m => `ห้ามรบกวนถึง ${m[1]}`],
  [/^Focus mode$/, () => 'โหมดโฟกัส'], [/^(.+) left$/, m => `เหลือ ${m[1]}`], [/^notifications and calls are held$/, () => 'พักการแจ้งเตือนและสายเรียกเข้า'], [/^(\d+) held$/, m => `พักไว้ ${m[1]}`],
  [/^Returns to (.+?) (at .+|when you end it)\.$/, m => `จะกลับเป็น${t(m[1])} ${m[2].startsWith('at') ? 'เวลา ' + m[2].slice(3) : 'เมื่อคุณปิด'}`], [/^set automatically \((.+)\)$/, m => `ตั้งอัตโนมัติ (${m[1]})`],
  [/^until (\d\d:\d\d)$/, m => `ถึง ${m[1]}`], [/^Escalate to team lead after$/, () => 'ส่งต่อหัวหน้าทีมเมื่อเลยกำหนด'], [/^(\d+) days without progress$/, m => `ไม่มีความคืบหน้า ${m[1]} วัน`], [/^waiting (\d+)d$/, m => `รอ ${m[1]} วัน`],
  [/^Desk of (.+)$/, m => `โต๊ะของ ${m[1]}`], [/^You have a desk in (.+)\. Make it yours\? In the office you can also sit on any free chair and press E to make it your permanent desk, or place a new desk\.$/, m => `คุณมีโต๊ะอยู่ที่${t(m[1])} อยากแต่งไหม ในออฟฟิศคุณยังนั่งเก้าอี้ว่างแล้วกด E เพื่อตั้งเป็นโต๊ะประจำ หรือวางโต๊ะใหม่ได้`], [/^is working on (T-\d+)$/, m => `กำลังทำ ${m[1]}`], [/^This video cannot play here \(code (\d+)\)\. Skipping…$/, m => `วิดีโอนี้เล่นในเว็บอื่นไม่ได้ (รหัส ${m[1]}) กำลังข้าม…`], [/^(\d+) links$/, m => `${m[1]} ลิงก์`], [/^Started by (.+)$/, m => `เปิดโดย ${m[1]}`], [/^Picked by (.+)$/, m => `เลือกโดย ${m[1]}`], [/^Now playing: (.+)$/, m => `กำลังเปิด: ${m[1]}`], [/^(\d+) BPM$/, m => `${m[1]} BPM`], [/^(.+) changed outfit$/, m => `${m[1]} เปลี่ยนชุด`], [/^joined the office as (.+)$/, m => `เข้าร่วมออฟฟิศในตำแหน่ง ${t(m[1])}`],
];
function trSeg(s) {
  if (Object.prototype.hasOwnProperty.call(TH, s)) return TH[s];
  for (const [re, f] of PATS) { if (!f) continue; const m = s.match(re); if (m) return f(m); }
  return null;
}
function t(s) {
  if (LANG !== 'th' || !s || typeof s !== 'string') return s;
  const k = s.trim(); if (!k || !/[A-Za-z]/.test(k)) return s;
  let r = trSeg(k);
  if (r == null && k.includes(' · ')) { const parts = k.split(' · '); const tr = parts.map(p => trSeg(p.trim()) ?? p); if (tr.some((x, i) => x !== parts[i])) r = tr.join(' · '); }
  if (r == null && /^[A-Z][^.]*[^.:]$/.test(k) && k.includes(': ')) { const i = k.indexOf(': '); const a = trSeg(k.slice(0, i)); if (a) r = a + ': ' + k.slice(i + 2); }
  return r == null ? s : s.replace(k, () => r);
}
/* live DOM translation */
const TR_ATTRS = ['placeholder', 'title', 'aria-label'];
const skipEl = el => !!(el && el.closest && el.closest('script,style,textarea,.notr,.txt,.ai-out'));
function trAttrs(el) { if (el.nodeType !== 1 || skipEl(el)) return; for (const a of TR_ATTRS) { const v = el.getAttribute(a); if (v && /[A-Za-z]/.test(v)) { const r = t(v); if (r !== v) el.setAttribute(a, r); } } }
function trText(n) { const p = n.parentElement; if (!p || skipEl(p)) return; const v = n.nodeValue; if (!v || !/[A-Za-z]/.test(v)) return; const r = t(v); if (r !== v) n.nodeValue = r; }
function trTree(root) {
  if (LANG !== 'th' || !root) return;
  if (root.nodeType === 3) return trText(root);
  if (root.nodeType !== 1) return;
  trAttrs(root);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let c; while ((c = w.nextNode())) { if (c.nodeType === 3) trText(c); else trAttrs(c); }
}
const trObs = new MutationObserver(muts => {
  if (LANG !== 'th') return;
  for (const m of muts) {
    if (m.type === 'childList') m.addedNodes.forEach(trTree);
    else if (m.type === 'characterData') trText(m.target);
    else if (m.type === 'attributes') trAttrs(m.target);
  }
});
trObs.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: TR_ATTRS });
function setLang(l) {
  LANG = l; try { localStorage.setItem('northdesk.lang', l); } catch (e) {}
  applyLangArrays(); closeModal(); closePop();
  if (typeof OB !== 'undefined' && OB.open) renderOnboarding(true);
  doRender(); if (LANG === 'th') trTree(document.body);
}
trTree(document.body);
