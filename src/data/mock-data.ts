import { BookProps } from "@/components/book/BookCard";

export const MOCK_BOOKS: BookProps[] = [
  {
    id: "book1",
    title: "The Midnight Library",
    author: "Matt Haig",
    cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGJvb2t8ZW58MHx8MHx8fDA%3D",
    condition: "Good",
    genre: "Fiction",
    owner: {
      name: "Alex Johnson",
      avatar: "",
      rating: 4.8
    }
  },
  {
    id: "book2",
    title: "Dune",
    author: "Frank Herbert",
    cover: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZHVuZXxlbnwwfHwwfHx8MA%3D%3D",
    condition: "Worn",
    genre: "Science Fiction",
    owner: {
      name: "Maya Rodriguez",
      avatar: "",
      rating: 4.5
    }
  },
  {
    id: "book3",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    cover: "https://images.unsplash.com/photo-1623227866882-c005c27be89e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFudGFzeSUyMGJvb2t8ZW58MHx8MHx8fDA%3D",
    condition: "Good",
    genre: "Fantasy",
    owner: {
      name: "Thomas Lee",
      avatar: "",
      rating: 4.9
    }
  },
  {
    id: "book4",
    title: "Atomic Habits",
    author: "James Clear",
    cover: "https://images.unsplash.com/photo-1598618253208-d75408cee680?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHNlbGYlMjBoZWxwJTIwYm9va3xlbnwwfHwwfHx8MA%3D%3D",
    condition: "New",
    genre: "Self-Help",
    owner: {
      name: "Sarah Johnson",
      avatar: "",
      rating: 4.7
    }
  },
  {
    id: "book5",
    title: "The Girl on the Train",
    author: "Paula Hawkins",
    cover: "https://images.unsplash.com/photo-1615224571799-505b47316bd5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bXlzdGVyeSUyMGJvb2t8ZW58MHx8MHx8fDA%3D",
    condition: "Good",
    genre: "Mystery",
    owner: {
      name: "David Chen",
      avatar: "",
      rating: 4.6
    }
  },
  {
    id: "book6",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    cover: "https://images.unsplash.com/photo-1592496431792-e043531bd198?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2xhc3NpYyUyMGJvb2t8ZW58MHx8MHx8fDA%3D",
    condition: "Worn",
    genre: "Fiction",
    owner: {
      name: "Emily Wilson",
      avatar: "",
      rating: 4.9
    }
  },
  {
    id: "book7",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8aGlzdG9yeSUyMGJvb2t8ZW58MHx8MHx8fDA%3D",
    condition: "New",
    genre: "History",
    owner: {
      name: "Michael Brown",
      avatar: "",
      rating: 4.7
    }
  },
  {
    id: "book8",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    cover: "https://images.unsplash.com/photo-1587876931567-564ce588bfbd?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHRocmlsbGVyJTIwYm9va3xlbnwwfHwwfHx8MA%3D%3D",
    condition: "Good",
    genre: "Mystery",
    owner: {
      name: "Jessica Park",
      avatar: "",
      rating: 4.8
    }
  },
  {
    id: "book9",
    title: "Project Hail Mary",
    author: "Andy Weir",
    cover: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8c3BhY2UlMjBib29rfGVufDB8fDB8fHww",
    condition: "New",
    genre: "Science Fiction",
    owner: {
      name: "Ryan Scott",
      avatar: "",
      rating: 4.6
    }
  },
  {
    id: "book10",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    cover: "https://images.unsplash.com/photo-1601049676869-9341d7890be7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW9uZXklMjBib29rfGVufDB8fDB8fHww",
    condition: "Good",
    genre: "Finance",
    owner: {
      name: "Laura Kim",
      avatar: "",
      rating: 4.9
    }
  },
  {
    id: "book11",
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    cover: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZmFudGFzeSUyMGJvb2t8ZW58MHx8MHx8fDA%3D",
    condition: "Worn",
    genre: "Fantasy",
    owner: {
      name: "Daniel White",
      avatar: "",
      rating: 4.7
    }
  },
  {
    id: "book12",
    title: "Educated",
    author: "Tara Westover",
    cover: "https://images.unsplash.com/photo-1517414204284-fb7e98b2e255?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1lbW9pciUyMGJvb2t8ZW58MHx8MHx8fDA%3D",
    condition: "Good",
    genre: "Biography",
    owner: {
      name: "Amanda Taylor",
      avatar: "",
      rating: 4.8
    }
  },
];
