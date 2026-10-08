/**
 * District-aware suggestions, NOT an exhaustive gazetteer. The text field accepts
 * additional towns, wards, villages, panchayats, and places in Malayalam or English.
 * Never infer exact location or expose entered locality by default.
 */
export const DISTRICT_MALAYALAM: Record<string,string> = {
  Thiruvananthapuram: "തിരുവനന്തപുരം", Kollam: "കൊല്ലം", Pathanamthitta: "പത്തനംതിട്ട",
  Alappuzha: "ആലപ്പുഴ", Kottayam: "കോട്ടയം", Idukki: "ഇടുക്കി", Ernakulam: "എറണാകുളം",
  Thrissur: "തൃശ്ശൂർ", Palakkad: "പാലക്കാട്", Malappuram: "മലപ്പുറം",
  Kozhikode: "കോഴിക്കോട്", Wayanad: "വയനാട്", Kannur: "കണ്ണൂർ", Kasaragod: "കാസർഗോഡ്"
};
export const KERALA_PLACES: Record<string,readonly string[]> = {
  Thiruvananthapuram: ["Thiruvananthapuram", "Kazhakkoottam", "Technopark", "Kovalam", "Vizhinjam", "Neyyattinkara", "Balaramapuram", "Kattakada", "Nedumangad", "Vattiyoorkavu", "Pattom", "Sreekaryam", "Attingal", "Varkala", "Kilimanur", "Venjaramoodu", "Pothencode", "Palode", "Kaniyapuram", "Poovar"],
  Kollam: ["Kollam", "Kottiyam", "Kundara", "Chathannoor", "Paravur", "Mayyanad", "Karunagappally", "Oachira", "Chavara", "Sasthamcotta", "Kottarakkara", "Punalur", "Pathanapuram", "Anchal", "Kadakkal", "Kulathupuzha", "Thenmala", "Chadayamangalam"],
  Pathanamthitta: ["Pathanamthitta", "Adoor", "Pandalam", "Thiruvalla", "Mallappally", "Ranni", "Konni", "Kozhencherry", "Elanthoor", "Aranmula", "Seethathode", "Vechoochira", "Kumbanad", "Pullad", "Perunad"],
  Alappuzha: ["Alappuzha", "Cherthala", "Mannancherry", "Mararikulam", "Ambalappuzha", "Punnapra", "Kalavoor", "Muhamma", "Haripad", "Kayamkulam", "Mavelikkara", "Chengannur", "Kuttanad", "Edathua", "Thakazhi", "Champakulam", "Arthunkal", "Aroor", "Thuravoor", "Kanjikuzhi", "Pallippuram"],
  Kottayam: ["Kottayam", "Changanassery", "Pala", "Ettumanoor", "Vaikom", "Kaduthuruthy", "Kanjirappally", "Ponkunnam", "Mundakayam", "Erattupetta", "Ramapuram", "Kuravilangad", "Kumarakom", "Manarcaud", "Puthuppally", "Karukachal", "Bharananganam", "Kidangoor"],
  Idukki: ["Thodupuzha", "Munnar", "Adimali", "Kattappana", "Kumily", "Thekkady", "Nedumkandam", "Peerumade", "Vagamon", "Idukki", "Cheruthoni", "Rajakkad", "Rajakumari", "Anakkara", "Vandiperiyar", "Painavu", "Marayoor", "Devikulam", "Udumbanchola"],
  Ernakulam: ["Kochi", "Fort Kochi", "Mattancherry", "Ernakulam", "Edappally", "Kakkanad", "Infopark", "Kaloor", "Vyttila", "Palarivattom", "Aluva", "Angamaly", "Perumbavoor", "Muvattupuzha", "Kothamangalam", "North Paravur", "Tripunithura", "Thrikkakara", "Eloor", "Kalamassery", "Cheranalloor", "Varapuzha", "Piravom", "Koothattukulam", "Vypin", "Njarakkal", "Puthencruz", "Maradu", "Panampilly Nagar", "Kadavanthra"],
  Thrissur: ["Thrissur", "Guruvayur", "Chavakkad", "Kunnamkulam", "Wadakkanchery", "Chelakkara", "Kodungallur", "Irinjalakuda", "Chalakudy", "Mala", "Puthukkad", "Kodakara", "Pavaratty", "Ollur", "Cherpu", "Mannuthy", "Amala Nagar", "Athirappilly", "Kaipamangalam", "Valapad"],
  Palakkad: ["Palakkad", "Ottappalam", "Shoranur", "Pattambi", "Mannarkkad", "Chittur", "Alathur", "Nenmara", "Kollengode", "Malampuzha", "Walayar", "Kanjikode", "Cherpulassery", "Sreekrishnapuram", "Kuzhalmannam", "Parli", "Vadakkencherry", "Agali"],
  Malappuram: ["Malappuram", "Manjeri", "Perinthalmanna", "Tirur", "Tanur", "Ponnani", "Nilambur", "Kottakkal", "Valanchery", "Edappal", "Kondotty", "Areekode", "Wandoor", "Vengara", "Chemmad", "Parappanangadi", "Kuttippuram", "Changaramkulam", "Mongam", "Kalpakanchery", "Tirurangadi"],
  Kozhikode: ["Kozhikode", "Calicut", "Vadakara", "Koyilandy", "Feroke", "Ramanattukara", "Beypore", "Kallai", "Mavoor", "Mukkom", "Thamarassery", "Koduvally", "Balussery", "Perambra", "Nadapuram", "Payyoli", "Kunnamangalam", "Chevayur", "Kuttiady", "Kakkodi", "Elathur"],
  Wayanad: ["Kalpetta", "Sulthan Bathery", "Mananthavady", "Vythiri", "Meppadi", "Ambalavayal", "Panamaram", "Meenangadi", "Pulpally", "Padinjarathara", "Pozhuthana", "Thirunelly", "Kenichira", "Kambalakkad", "Muttil"],
  Kannur: ["Kannur", "Thalassery", "Payyannur", "Taliparamba", "Mattannur", "Iritty", "Panoor", "Kuthuparamba", "Pappinisseri", "Edakkad", "Dharmadam", "Chakkarakkal", "Azhikode", "Valapattanam", "Cherukunnu", "Peravoor", "Sreekandapuram", "Koothuparamba", "Muzhappilangad"],
  Kasaragod: ["Kasaragod", "Kanhangad", "Nileshwaram", "Bekal", "Cheruvathur", "Uppala", "Manjeshwaram", "Badiadka", "Kumbla", "Hosdurg", "Vellarikundu", "Panathur", "Trikaripur", "Uduma", "Mulleria", "Periya"]
};
export const placeLabel = (district: string, language: "en"|"ml") => language === "ml" ? (DISTRICT_MALAYALAM[district] || district) : district;
