import { NextResponse } from 'next/server';

export const revalidate = 3600; // 1h

export async function GET() {
  try {
    const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? 'Kauadsouza';
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error('GitHub API error');

    const data = await res.json();

    return NextResponse.json({
      public_repos: data.public_repos ?? 0,
      followers: data.followers ?? 0,
      following: data.following ?? 0,
    });
  } catch {
    return NextResponse.json({ public_repos: 0, followers: 0, following: 0 }, { status: 200 });
  }
}
