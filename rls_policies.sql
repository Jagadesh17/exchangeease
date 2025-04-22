-- First, drop existing policies if they exist
drop policy if exists "Anyone can view books" on "books";
drop policy if exists "Users can insert their own books" on "books";
drop policy if exists "Users can update their own books" on "books";
drop policy if exists "Users can delete their own books" on "books";

-- Enable RLS on the books table
alter table "books" enable row level security;

-- Policy for reading books (allow all authenticated users to read)
create policy "Anyone can view books"
on "books"
for select
to authenticated
using (true);

-- Policy for inserting books (allow authenticated users to insert their own books)
create policy "Users can insert their own books"
on "books"
for insert
to authenticated
with check (auth.uid() = user_id);

-- Policy for updating books (only book owner can update)
create policy "Users can update their own books"
on "books"
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Policy for deleting books (only book owner can delete)
create policy "Users can delete their own books"
on "books"
for delete
to authenticated
using (auth.uid() = user_id); 