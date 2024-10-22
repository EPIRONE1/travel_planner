"use client"

import { signIn } from 'next-auth/react';
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"

export default function Component() {
  return (
    <div className="flex items-center justify-center min-h-screen"> {/* 이 줄을 추가 */}
      <Card className="w-[300px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">로그인</CardTitle>
          <CardDescription>소셜 계정으로 로그인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => signIn('google')}  // Google로 로그인 처리
          >
            Google로 로그인
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          계정이 없으신가요? <a href="#" className="ml-1 underline">회원가입</a>
        </CardFooter>
      </Card>
    </div>
  )
}
