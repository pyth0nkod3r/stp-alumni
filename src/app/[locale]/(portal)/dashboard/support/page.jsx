'use client';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/lib/hooks/useUser';
import { useSubmitSupportTicket } from '@/lib/hooks/useSupportQueries';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function SupportPage() {
  const { user } = useAuth();
  const { mutate: submitTicket, isPending } = useSubmitSupportTicket();
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.length < 10) return;

    submitTicket(
      { name: user?.first_name + ' ' + user?.last_name, email: user?.email, subject, message },
      {
        onSuccess: () => {
          setSubmitted(true);
          setSubject('');
          setMessage('');
        },
      }
    );
  };

  const handleReset = () => {
    setSubmitted(false);
  };

  return (
    <>
      <Helmet>
        <title>Help & Support | Blazing Connect</title>
      </Helmet>
      
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-[#233389] mb-6">Help & Support</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Submitted</h2>
              <p className="text-gray-600 mb-6">Your support request has been submitted successfully. We will get back to you soon.</p>
              <Button onClick={handleReset} variant="outline" className="text-[#233389] border-[#233389] hover:bg-blue-50">
                Submit Another Request
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={`${user?.first_name || ''} ${user?.last_name || ''}`} 
                      disabled 
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={user?.email || ''} 
                      disabled 
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    placeholder="Briefly describe your issue" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Provide additional details..." 
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    minLength={10}
                  />
                  {message.length > 0 && message.length < 10 && (
                    <p className="text-xs text-red-500">Message must be at least 10 characters.</p>
                  )}
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-[#233389] hover:bg-[#1a2566] text-white"
                disabled={isPending || message.length < 10}
              >
                {isPending ? 'Submitting...' : 'Submit Support Request'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
