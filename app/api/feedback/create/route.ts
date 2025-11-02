export async function POST(req: Request) {
  const { username, feedback } = await req.json();
  console.log({ username, feedback });
  return new Response(JSON.stringify({ message: "Feedback submitted" }), {
    status: 200,
  });
}
